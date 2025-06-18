// Notes: Minimal MSW setup to stub external API calls
import { setupServer } from 'msw/node'
import { rest } from 'msw'

export const handlers = [
  // Example handler for any external request
  rest.all(/.*/, (_req, res, ctx) => res(ctx.json({})))
]

export const server = setupServer(...handlers)
