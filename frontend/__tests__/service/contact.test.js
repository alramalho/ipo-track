import {contact} from "../../src/service/contact";
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

  it('should properly call the contact endpoint', async () => {
    moxios.stubRequest(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
      status: 200,
    })

    const response = await contact({
      email: "test-email",
      subject: "test-subject",
      message: "test-keyword"
    })
    const request = moxios.requests.mostRecent()

    expect(request.config.method).toEqual('post')
    expect(JSON.parse(request.config.data)).toEqual({
      email: "test-email",
      subject: "test-subject",
      message: "test-keyword"
    })
    expect(response.status).toBe(200)

  })
})