import { useState } from 'react'
import { Box, TextField, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

export interface JokeFormValues {
  question: string
  answer: string
}

export interface JokeFormProps {
  onSubmit?: (values: JokeFormValues) => void
}

function JokeForm({ onSubmit }: JokeFormProps) {
  const { t } = useTranslation()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!onSubmit) return
    onSubmit({ question, answer })
    setQuestion('')
    setAnswer('')
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <TextField
        label={t('jokes.form.question')}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label={t('jokes.form.answer')}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
        fullWidth
      />
      <Button type="submit" variant="contained" color="secondary">
        {t('jokes.form.submit')}
      </Button>
    </Box>
  )
}

export default JokeForm
