import Link from 'next/link'
import Inbox from 'components/functional-ui/inbox'
import Categories from 'components/functional-ui/inbox/categories'
import Labels from 'components/functional-ui/inbox/labels'
import Links from 'components/functional-ui/inbox/links'

const Index = () => (
  <div className="w-full p-4 rounded-lg bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
    <div className="flex items-start justify-start w-full">
      <div className="flex-shrink-0 w-64 p-4">
        <div className="mb-4">
          <Link href="/compose">
            <a className="btn btn-default btn-block rounded bg-base hover:bg-blue-600 text-white block text-center">
              Compose email
            </a>
          </Link>
        </div>
        <Links />
        <Categories />
        <Labels />
      </div>
      <div className="w-full flex flex-col p-4">
        <Inbox />
      </div>
    </div>
  </div>
)
export default Index
