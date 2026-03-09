// Tracks API Endpoint
import { supabaseHelpers } from '../../lib/supabase'
import { withCors } from '../../lib/cors'

async function tracksHandler(req, res) {
  // Only allow POST, GET, PUT, DELETE
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'User ID required' })
    }

    switch (req.method) {
      case 'GET':
        // Get all tracks for a user
        const tracks = await supabaseHelpers.getUserTracks(user_id)
        return res.status(200).json({ tracks })

      case 'POST':
        // Create a new track
        const { trackData } = req.body
        const newTrack = await supabaseHelpers.saveTrack({
          ...trackData,
          user_id
        })
        return res.status(201).json({ track: newTrack })

      case 'PUT':
        // Update a track
        const { trackId, updateData } = req.body
        const updatedTrack = await supabaseHelpers.updateTrack(trackId, updateData)
        
        if (!updatedTrack) {
          return res.status(404).json({ error: 'Track not found' })
        }
        
        return res.status(200).json({ track: updatedTrack })

      case 'DELETE':
        // Delete a track
        const { trackId: deleteTrackId } = req.body
        const deleted = await supabaseHelpers.deleteTrack(deleteTrackId)
        
        if (!deleted) {
          return res.status(404).json({ error: 'Track not found' })
        }
        
        return res.status(200).json({ message: 'Track deleted successfully' })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Tracks API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(tracksHandler)
