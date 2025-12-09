import { Card, CardContent, CardActions, Typography, Button } from '@mui/material'

export interface JokeCardProps {
  joke: { id: string; question: string; answer: string } | null
  onDelete?: () => void
  highlight?: boolean
}

function JokeCard({ joke, onDelete, highlight = false }: JokeCardProps) {
  if (!joke) return null

  return (
    <Card
      sx={{
        mb: 2,
        border: highlight ? '2px solid' : '1px solid',
        borderColor: highlight ? 'primary.main' : 'divider',
      }}
    >
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          {joke.question}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {joke.answer}
        </Typography>
      </CardContent>
      {onDelete && (
        <CardActions>
          <Button size="small" color="error" onClick={onDelete}>
            Supprimer
          </Button>
        </CardActions>
      )}
    </Card>
  )
}

export default JokeCard
