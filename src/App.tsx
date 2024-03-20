import 'bootstrap/dist/css/bootstrap.css'

import { useMemo } from 'react'
import { Container } from 'react-bootstrap'
import { Navigate, Route, Routes } from 'react-router-dom'
import { NewNote } from './component/newNote'
import { useLocalStorage } from './component/useLocalStorage'
import { v4 as uuidV4 } from 'uuid'
import { NoteList } from './component/NoteList'
import { NoteLayout } from './component/NoteLayout'
import { Note } from './component/Note'
import { EditNote } from './component/EditNote'


export type Note = {
  id: string
} & NoteData

export type RawNote = {
  id: string
} & RawNoteData

export type RawNoteData = {
  title: string
  markdown: string
  tagIds: string[]
}

export type NoteData = {
  title: string
  markdown: string
  tags: Tag[]
}
export type Tag = {
  label: string
  id: string
}

function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>('notes', [])
  const [tags, setTags] = useLocalStorage<Tag[]>('TAGS', [])

  const notesWithTags = useMemo(() => {
    return notes.map((note) => {
      return {
        ...note,
        tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
      }
    })
  }, [notes, tags])

  function onCreateNote({ tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return [
        ...prevNotes,
        { ...data, id: uuidV4(), tagIds: tags.map((tag) => tag.id) },
      ]
    })
  }

  function onUpdateNote(id: string, { tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === id) {
          return { ...note, ...data, tagIds: tags.map((tag) => tag.id) }
        } else {
          return note
        }
      })
    })
  }

  function onDeleteNote(id: string) {
    setNotes((prevNote) => {
      return prevNote.filter((note) => note.id !== id)
    })
  }

  function addTag(tag: Tag) {
    setTags((prev) => [...prev, tag])
  }

  function updateTag(id: string, label: string) {
    setTags((prevTags) => {
      return prevTags.map((tag) => {
        if (tag.id === id) {
          return { ...tag, label }
        } else {
          return tag
        }
      })
    })
  }

  function deleteTag(id: string) {
    setTags((prevTags) => {
      return prevTags.filter((tag) => tag.id !== id)
    })
  }

  return (
    <>
      <Container className='my-4'>
        <Routes>
          <Route
            path='/'
            element={
              <NoteList
                availableTags={tags}
                notes={notesWithTags}
                onUpdateTag={updateTag}
                onDeleteTag={deleteTag}
              />
            }
          />
          <Route
            path='new'
            element={
              <NewNote
                onSubmit={onCreateNote}
                onAddTag={addTag}
                availableTags={tags}
              />
            }
          />
          <Route path='/:id' element={<NoteLayout notes={notesWithTags} />}>
            <Route index element={<Note onDelete={onDeleteNote} />} />
            <Route
              path='edit'
              element={
                <EditNote
                  onSubmit={onUpdateNote}
                  onAddTag={addTag}
                  availableTags={tags}
                />
              }
            />
          </Route>
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
