import { Icon } from '../../../Editor/components/Toolbar'

const DashboardItem = props => {
  const { id, onOpen, onDelete } = props

  return (
    <li className="w-full odd:bg-slate-200 even:bg-slate-250">
      <div 
        onClick={() => { onOpen(id) }} 
        className="p-2 bg-transparent"
      >
        {id}
        <button 
          title='delete' 
          style={{ background: 'transparent', border: '0', float: 'right', padding: '0' }} 
          onClick={(e) => { 
            e.stopPropagation()
            onDelete(id)
          }}>
          <Icon>delete</Icon>
        </button>
      </div>
    </li>
  )
}

export default DashboardItem
