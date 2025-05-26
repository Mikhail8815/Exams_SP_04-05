import { useEffect } from "react"
import { createRoot } from "react-dom/client"
import { Provider, useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { asyncThunkCreator, buildCreateSlice, configureStore } from "@reduxjs/toolkit"
import { string, z } from "zod"
// Types
type Product = {
  id: string
  title: string
  description: string
  price: number
}
type ProductsResponse = {
  total: number
  messages: string[]
  page: number
  pageCount: number
  data: Product[]
}
// ZOD schemas
const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number().positive(),
})
const productsResponseSchema = z.object({
  total: z.number().positive(),
  messages: z.array(string()),
  page: z.number().positive(),
  pageCount: z.number().positive(),
  data: z.array(productSchema),
})
// Api
const instance = axios.create({ baseURL: "https://exams-frontend.kimitsu.it-incubator.io/api/" })
const api = {
  getProducts() {
    return instance.get<ProductsResponse>("products")
  },
}
// Slice
const createAppSlice = buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })
const slice = createAppSlice({
  name: "products",
  initialState: {
    products: [] as Product[],
  },
  selectors: {
    selectProducts: (state) => state.products,
  },
  reducers: (create) => ({
    fetchProducts: create.asyncThunk(
      async (_arg, { rejectWithValue }) => {
        try {
          const res = await api.getProducts()
          productsResponseSchema.parse(res.data) // 💎 ZOD
          return { products: res.data.data }
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
          state.products = action.payload.products
        },
      },
    ),
  }),
})
const filmsReducer = slice.reducer
const { fetchProducts } = slice.actions
const { selectProducts } = slice.selectors
// App
const App = () => {
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectProducts)
  useEffect(() => {
    dispatch(fetchProducts())
  }, [])
  return (
    <>
      <h2>🛒 Products</h2>
      {products.map((product) => {
        return (
          <div key={product.id}>
            <b>{product.title}</b>
            <p>{product.description}</p>
            <p>💵 {product.price} $</p>
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
