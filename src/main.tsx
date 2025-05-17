import { configureStore, createSlice } from "@reduxjs/toolkit"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { useEffect } from "react"
import { createRoot } from "react-dom/client"
import { Provider, useDispatch, useSelector } from "react-redux"

// Slice
const appSlice = createSlice({
  name: "app",
  initialState: {
    error: null as string | null,
  },
  reducers: (create) => ({
    setError: create.reducer<{ error: string | null }>((state, action) => {
      state.error = action.payload.error
    }),
  }),
  selectors: {
    selectError: (state) => state.error,
  },
})

const { selectError } = appSlice.selectors
const { setError } = appSlice.actions

// Api
type Post = {
  body: string
  id: string
  title: string
  userId: string
}

type Error = {
  errors: { field: string; message: string }[]
}

const api = createApi({
  reducerPath: "api",
  baseQuery: async (args, api, extraOptions) => {
    const result = await fetchBaseQuery({
      baseUrl: "https://exams-frontend.kimitsu.it-incubator.io/api/",
    })(args, api, extraOptions)

    if (result.error) {
      if (result.error.status === 400) {
        const error = (result.error.data as Error).errors[0].message
        api.dispatch(setError({ error }))
      }
    }
    return result
  },
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => "posts",
      providesTags: ["Post"],
    }),
    removePost: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        method: "DELETE",
        url: `posts/${id}?delay=20`,
      }),
      invalidatesTags: ["Post"],
    }),
  }),
})

const { useGetPostsQuery, useRemovePostMutation } = api

// UI
const Header = () => <div style={{ width: "100%", background: "gray", border: "none", height: "50px" }}>header</div>

const LinearProgress = () => (
  <hr
    style={{
      height: "10px",
      width: "100%",
      background: "lightblue",
      border: "none",
      position: "absolute",
      left: "0px",
      top: "50px",
      right: "0px",
    }}
  />
)

const App = () => {
  const error = useSelector(selectError)

  const dispatch = useDispatch()

  useEffect(() => {
    setTimeout(() => {
      dispatch(setError({ error: null }))
    }, 4000)
  }, [error])

  return (
    <>
      <Header />
      {error && <h1 style={{ color: "red" }}>{error}</h1>}
      <Posts />
    </>
  )
}

const Posts = () => {
  const { data, isSuccess, isLoading: isPostsLoading } = useGetPostsQuery()
  const [removePost, { isLoading: isRemovePostLoading }] = useRemovePostMutation()

  const deletePostHandler = (id: string) => {
    removePost(id)
  }

  if (isPostsLoading || isRemovePostLoading) {
    return <LinearProgress />
  }

  return (
    <>
      {isSuccess && (
        <>
          <h2>Posts</h2>
          {data?.map((el) => {
            return (
              <div key={el.id} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ border: "1px solid", margin: "5px", padding: "5px", width: "200px" }}>
                  <p>
                    <b>title</b> - {el.title}
                  </p>
                </div>
                <button onClick={() => deletePostHandler(el.id)}>Delete post</button>
              </div>
            )
          })}
        </>
      )}
    </>
  )
}

// Store
const store = configureStore({
  reducer: {
    [appSlice.name]: appSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>,
)

// 📜 Описание:
// Нажмите на кнопку удаления поста. Пост не удалится.

// 🪛 Задача:
// Ваша задача состоит в том, что разобраться почему пост не удаляется и вывести сообщение
// об ошибке на экран.
// Что нужно написать вместо "❗X" для того, чтобы при удалении поста он увидел ошибку
// ❗ Для типизации ошибки используйте type assertion с типом Error