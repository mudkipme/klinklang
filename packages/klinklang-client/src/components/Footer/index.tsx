import { Link, Typography } from '@mui/material'
import React from 'react'

export const KlinklangFooter: React.FC = () => {
  return (
    <Typography variant="body2" sx={{
      maxWidth: '62.5rem',
      margin: '0 auto'
    }} padding={2}>
      &copy; <Link href="https://52poke.wiki" color="inherit">52Poké Wiki</Link>
    </Typography>
  )
}
