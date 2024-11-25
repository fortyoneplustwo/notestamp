import { Dialog, DialogContent } from '../ui/dialog'

const ModalLayout = ({ onClose, children }) => {
  return (
    <Dialog open modal onOpenChange={() => {onClose()}}>
      <DialogContent>
        { children }
      </DialogContent>
    </Dialog>
  )
}

export default ModalLayout
