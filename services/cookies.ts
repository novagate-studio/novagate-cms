import Cookies from 'universal-cookie'

const cookies = new Cookies(null, {
  path: '/',
  domain: process.env.NEXT_PUBLIC_ENVIRONMENT === 'local' ? 'localhost' : 'cms.novagate.vn',
})

export const cookiesInstance = cookies
