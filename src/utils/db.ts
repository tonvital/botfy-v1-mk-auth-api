export function exclude(user: any, ...keys: any) {
  for (let key of keys) {
    delete user[key]
  }
  return user
}
