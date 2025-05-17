import SnippetLists from '../components/snippets/SnippetLists'
import CollectionList from '../components/collections/CollectionList'

const Dashboard = () => {
  return (
    <div className='flex justify-between p-3'>
      <div>
        <SnippetLists />
      </div>
      <div>
        <CollectionList />
      </div>
    </div>
  )
}

export default Dashboard