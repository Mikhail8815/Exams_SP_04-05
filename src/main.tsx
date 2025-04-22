import { configureStore, createSlice } from "@reduxjs/toolkit"
   import { createRoot } from "react-dom/client"
   import { Provider, useDispatch, useSelector } from "react-redux"
   type Product = {
     id: number
     name: string
     inStock: boolean
   }
   // slice
   const slice = createSlice({
     name: "products",
     initialState: [
       { id: 1, name: "Laptop", inStock: true },
       { id: 2, name: "Headphones", inStock: false },
       { id: 3, name: "Smartphone", inStock: true },
     ] as Product[],
     reducers: {
       toggleInStock: (state, action) => {
         const product = state.find((product) => product.id === action.payload.id)
         if (product) {
           product.inStock = action.payload.inStock
         }
       },
       clearStock: (state) => {
         return []
       },
     },
     selectors: {
       selectProducts: (state) => state,
     },
   })
   const { toggleInStock, clearStock } = slice.actions
   const { selectProducts } = slice.selectors
   // App.tsx
   const App = () => {
     const products = useAppSelector(selectProducts)
     const dispatch = useAppDispatch()
     const handleLogout = () => {
       dispatch(clearStock())
     }
     const toggleProductStock = (product: Product) => {
       dispatch(toggleInStock({ id: product.id, inStock: !product.inStock }))
     }
     return (
       <div>
         <button onClick={handleLogout}>Logout</button>
         <ul>
           {products.map((product) => (
             <li key={product.id}>
               <span
                 style={{
                   color: product.inStock ? "green" : "red",
                 }}
               >
                 {product.name} ({product.inStock ? "In Stock" : "Out of Stock"})
               </span>
               <button onClick={() => toggleProductStock(product)}>
                 {product.inStock ? "Mark Out of Stock" : "Mark In Stock"}
               </button>
             </li>
           ))}
         </ul>
       </div>
     )
   }
   // store.ts
   const store = configureStore({
     reducer: {
       products: slice.reducer,
     },
   })
   type RootState = ReturnType<typeof store.getState>
   type AppDispatch = typeof store.dispatch
   const useAppDispatch = useDispatch.withTypes<AppDispatch>()
   const useAppSelector = useSelector.withTypes<RootState>()
   // main.ts
   createRoot(document.getElementById("root")!).render(
     <Provider store={store}>
       <App />
     </Provider>,
   )
