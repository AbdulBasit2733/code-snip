import SnippetCard from './SnippetCard'

const SnippetList = ({ snippets, searchTerm, onOpenEditForm, onDelete, onInvite }) => {

  const filteredSnippets = snippets?.filter(snippet =>
    snippet?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet?.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet?.collection?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // console.log("Filtered Snippets", filteredSnippets);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredSnippets.map((snippet) => (
        <SnippetCard 
          key={snippet._id} 
          snippet={snippet}
          onOpenEditForm={onOpenEditForm}
          onDelete={onDelete}
          onInvite={onInvite}
        />
      ))}
      {filteredSnippets.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No snippets found matching your search.
        </div>
      )}
    </div>
  )
}


export default SnippetList