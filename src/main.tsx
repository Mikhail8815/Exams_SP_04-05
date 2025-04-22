import { useEffect } from "react"
import { createRoot } from "react-dom/client"
import { Provider, useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { asyncThunkCreator, buildCreateSlice, configureStore } from "@reduxjs/toolkit"
import { z } from "zod"
// Types
type Film = {
  id: number
  nameOriginal: string
  description: string
  ratingImdb: number
}
type FilmsResponse = {
  total: number
  messages: string[]
  page: number
  pageCount: number
  data: Film[]
}
// ZOD schemas
const filmSchema = z.object({
  id: z.string(),
  nameOriginal: z.string(),
  description: z.string(),
  ratingImdb: z.number(),
})
const filmsResponseSchema = z.object({
  total: z.number().int().positive(),
  messages: z.array(z.string()),
  page: z.number().int().positive(),
  pageCount: z.number().int().positive(),
  data: filmSchema.array(),
})
// Api
const instance = axios.create({ baseURL: "https://exams-frontend.kimitsu.it-incubator.io/api/" })
const api = {
  getFilms() {
    return instance.get<FilmsResponse>("films")
  },
}
// Slice
const createAppSlice = buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })
const slice = createAppSlice({
  name: "films",
  initialState: {
    films: [] as Film[],
  },
  selectors: {
    selectFilms: (state) => state.films,
  },
  reducers: (create) => ({
    fetchFilms: create.asyncThunk(
      async (_arg, { rejectWithValue }) => {
        try {
          const res = await api.getFilms()
          filmsResponseSchema.parse(res.data) // 💎 ZOD
          return { films: res.data.data }
        } catch (error) {
          if (error instanceof z.ZodError) {
            alert("Zod error")
            console.table(error.issues)
          }
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state.films = action.payload.films
        },
      },
    ),
  }),
})
const filmsReducer = slice.reducer
const { fetchFilms } = slice.actions
const { selectFilms } = slice.selectors
// App
const App = () => {
  const dispatch = useAppDispatch()
  const films = useAppSelector(selectFilms)
  useEffect(() => {
    dispatch(fetchFilms())
  }, [])
  return (
    <>
      <h2>🎦 Films</h2>
      {films.map((film) => {
        return (
          <div key={film.id}>
            <b>{film.nameOriginal}</b>
            <p>{film.description}</p>
            <p>⭐ {film.ratingImdb} </p>
          </div>
        )
      })}
    </>
  )
}
// Store
const store = configureStore({
  reducer: {
    [slice.name]: filmsReducer,
  },
})
type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()
createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
ыввцав