variable "client_secret" {
  type = string
}
variable "client_id" {
  type = string
}
variable "redirect_uris" {
  type = list(string)
}
variable "token" {
  type = object({
    access_token = string,
    refresh_token = string,
    scope = string,
    token_type = string,
    expiry_date = number
  })
}

provider "google-drive" {
  token = var.token
  client_secret = var.client_secret
  client_id = var.client_id
  redirect_uris = var.redirect_uris
}

resource "google-drive_file" "myFile" {
  name = "very cool file"
}
