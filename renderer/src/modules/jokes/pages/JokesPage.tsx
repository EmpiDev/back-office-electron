import { useEffect, useState } from 'react'
import { Container, Box, Typography, Button, Divider } from '@mui/material'
import { getAllJokes, addJoke } from '@/services/jokes/jokes.service'
import JokeCard from '@/modules/jokes/components/JokeCard/JokeCard'
import JokeForm, { JokeFormValues } from '@/modules/jokes/components/JokeForm/JokeForm'
import { useTranslation } from 'react-i18next'

export interface Joke {
  id: string
  question: string
  answer: string
}

function JokesPage() {
  const { t } = useTranslation()
  const [jokes, setJokes] = useState<Joke[]>([])
  const [currentJoke, setCurrentJoke] = useState<Joke | null>(null)

  useEffect(() => {
    const initialJokes = getAllJokes() as Joke[]
    setJokes(initialJokes)
  }, [])

  const showRandomJoke = () => {
    if (jokes.length === 0) return
    const index = Math.floor(Math.random() * jokes.length)
    const next = jokes[index]
    if (jokes.length >= 2 && next.id === currentJoke?.id) {
      showRandomJoke()
    } else {
      setCurrentJoke(next)
    }
  }

  const handleAddJoke = (jokeInput: JokeFormValues) => {
    const newJoke = addJoke(jokeInput) as Joke
    setJokes((prev) => [...prev, newJoke])
  }

  return (
    <Container
      disableGutters
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        px: 2,
      }}
    >
      <Box sx={{ mt: { xs: 2, md: 4 }, mb: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('jokes.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom align="center">
          {t('jokes.description')}
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={showRandomJoke}>
            {t('jokes.showRandom')}
          </Button>
        </Box>
      </Box>

      {currentJoke && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('jokes.current')}
          </Typography>
          <JokeCard joke={currentJoke} highlight />
        </Box>
      )}

      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: 4 }}>
        <JokeForm onSubmit={handleAddJoke} />
      </Box>
    </Container>
  )
}

export default JokesPage
