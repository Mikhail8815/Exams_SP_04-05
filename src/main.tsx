import { configureStore, createSlice } from "@reduxjs/toolkit"
import { createRoot } from "react-dom/client"
import { Provider, useDispatch, useSelector } from "react-redux"

type Note = {
  id: number
  content: string
  important: boolean
}

// slice
const slice = createSlice({
  name: "notes",
  initialState: {
    items: [
      { id: 1, content: "Buy groceries", important: false },
      { id: 2, content: "Schedule meeting", important: true },
      { id: 3, content: "Call mom", important: false },
    ],
  },
  reducers: {
    updateNote: (state, action) => {
      const note = state.items.find((note) => note.id === action.payload.id)
      if (note) {
        note.important = action.payload.important
      }
      return state
    },
  },
  selectors: {
    selectNotes: (state) => state.items,
  },
})

const { updateNote } = slice.actions
const { selectNotes } = slice.selectors

// App.tsx
const App = () => {
  const notes = useAppSelector(selectNotes)
  const dispatch = useAppDispatch()

  const toggleImportance = (note: Note) => {
    dispatch(updateNote({ id: note.id, important: !note.important }))
  }

  return (
    <ul>
      {notes.map((note) => (
        <li key={note.id}>
          <span
            style={{
              fontWeight: note.important ? "bold" : "normal",
            }}
          >
            {note.content}
          </span>
          <button onClick={() => toggleImportance(note)}>{note.important ? "Unmark" : "Mark Important"}</button>
        </li>
      ))}
    </ul>
  )
}

// store.ts
const store = configureStore({
  reducer: {
    notes: slice.reducer,
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

// 📜 Описание:
// При нажатии на кнопку Mark Important или Unmark рядом с заметкой, важность заметки не обновляется 🥲

// 🪛 Задача:
// Перепишите изменение стейта таким образом, чтобы при нажатии на кнопку Mark Important или Unmark,
// состояние важности заметки обновлялось.
// В качестве ответа укажите исправленный код написанный вместо return state.
// ❗Изменение стейта должно быть написано мутабельным образом
// ❗Не используйте деструктуризацию action.payload (const {id} = action.payload)
// ❗Не создавайте переменные из action.payload (const id = action.payload.id)
