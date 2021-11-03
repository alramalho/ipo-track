import {subscribe} from "../../src/service/subscribe";
import moxios from 'moxios'


describe('when testing the service', () => {

  beforeEach(function () {
    // import and pass your custom axios instance to this method
    moxios.install()
  })

  afterEach(function () {
    // import and pass your custom axios instance to this method
    moxios.uninstall()
  })

  it('should properly call the subscribe endpoint', async () => {
    moxios.stubRequest(`${process.env.NEXT_PUBLIC_API_URL}/subscribe`, {
      status: 200,
    })

    const response = await subscribe({
      email: "test-email",
      keyword: "test-keyword"
    })
    const request = moxios.requests.mostRecent()

    expect(request.config.method).toEqual('post')
    expect(JSON.parse(request.config.data)).toEqual({
      email: "test-email",
      keyword: "test-keyword"
    })
    expect(response.status).toBe(200)

  })
})