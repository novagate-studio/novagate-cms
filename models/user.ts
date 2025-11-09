export type UserIdentityDocument = {
  document_type: string
  document_number: string
  issue_date: string
  place_of_issue: string
}

export type User = {
  id: string
  phone: string
  full_name: string
  email: string
  dob: string
  gender: string
  username: string
  address: string
  roles: string
  created_at: string
  updated_at: string
  status: string
  phone_verified: boolean
  phone_verified_at: string
  user_identity_documents: UserIdentityDocument[]
}
