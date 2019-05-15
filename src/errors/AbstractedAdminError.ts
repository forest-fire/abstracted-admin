export class AbstractedAdminError extends Error {
  public firemodel = true;
  public code: string;
  constructor(message: string, name: string = "abstracted-admin/error") {
    super(message);
    this.name = name;
    this.code = name.split("/").pop();
  }
}
