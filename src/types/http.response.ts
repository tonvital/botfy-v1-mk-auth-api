import { Response } from 'express'

export default class HttpResponse {
  public static success(responseBody: any, response?: Response) {
    const ret = JSON.parse(
      `{"success": true, "result": ${JSON.stringify(responseBody)}}`
    )

    if (response) {
      return response.status(200).send(ret)
    }

    return ret
  }

  public static error(
    response: Response,
    errorMessage: string = 'Oops! Something is wrong.',
    errorStatusCode: number = 400
  ) {
    return response
      .status(errorStatusCode)
      .send({ success: false, errorMessage })
  }
}
