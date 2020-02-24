import { EHttpStatus } from 'models/transport';

class HttpException {
  private error: string;
  private status: EHttpStatus;
  public constructor(error: string, status: EHttpStatus) {
    this.error = error;
    this.status = status;
  }
  public getError() {
    const { error, status } = this;
    return {
      error,
      status,
    };
  }
}
export default HttpException;
