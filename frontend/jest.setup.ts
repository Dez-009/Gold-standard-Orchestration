// Notes: Setup MSW server and global mocks for tests
import { server } from './tests/mswServer'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
