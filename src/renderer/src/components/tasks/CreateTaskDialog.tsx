import React from 'react'
import { TaskPriority, TaskCategory, RecurrencePattern } from '@prisma/client'
import { cn } from '@/lib/utils'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText } from 'lucide-react'
import { categoryColorMap, priorityColorMap } from '@/lib/taskUtils'
import { NewTask } from '@/types/task'

interface CreateTaskDialogProps {
  isOpen: boolean
  newTask: NewTask
  onClose: () => void
  onChange: (updates: Partial<NewTask>) => void
  onSubmit: () => void
}

export const CreateTaskDialog = React.memo(({
  isOpen,
  newTask,
  onClose,
  onChange,
  onSubmit
}: CreateTaskDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:gap-6 py-2 sm:py-4">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Enter task title"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={newTask.description || ''}
                onChange={(e) => onChange({ description: e.target.value || null })}
                placeholder="Enter task description"
                className="mt-1.5 min-h-[80px] sm:min-h-[100px]"
              />
            </div>

            {/* Date Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={newTask.startDate ? new Date(newTask.startDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null
                    onChange({ startDate: date })
                  }}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-sm font-medium">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={newTask.dueDate ? new Date(newTask.dueDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null
                    onChange({ dueDate: date })
                  }}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Task Details Section */}
            <div className="space-y-3 sm:space-y-4 rounded-lg border bg-muted/30 p-3 sm:p-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Task Details
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    Priority <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => onChange({ priority: value as TaskPriority })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskPriority).map(priority => (
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              priorityColorMap[priority].badge
                            )} />
                            {priority.charAt(0) + priority.slice(1).toLowerCase()}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm">Category</Label>
                  <Select
                    value={newTask.category || ''}
                    onValueChange={(value) => onChange({ category: value as TaskCategory || null })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            {React.createElement(categoryColorMap[category].icon, { 
                              className: cn("h-4 w-4", categoryColorMap[category].text)
                            })}
                            {category.charAt(0) + category.slice(1).toLowerCase()}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3 sm:space-y-4">
              {/* Recurrence Toggle */}
              <div className="flex items-center justify-between py-3 border-b">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Recurrence</h4>
                  <p className="text-sm text-muted-foreground">Repeat this task on a schedule</p>
                </div>
                <Switch
                  checked={!!newTask.recurrence}
                  onCheckedChange={(checked) => 
                    onChange({
                      recurrence: checked ? RecurrencePattern.DAILY : null
                    })
                  }
                />
              </div>

              {newTask.recurrence && (
                <div className="pl-0 sm:pl-4">
                  <Label className="text-sm">Frequency</Label>
                  <Select
                    value={newTask.recurrence}
                    onValueChange={(value) => onChange({ 
                      recurrence: value as RecurrencePattern
                    })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(RecurrencePattern).map(pattern => (
                        <SelectItem key={pattern} value={pattern}>
                          {pattern.charAt(0) + pattern.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Notes Section */}
              <div className="pt-2">
                <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newTask.notes || ''}
                  onChange={(e) => onChange({ 
                    notes: e.target.value || null 
                  })}
                  placeholder="Add any additional notes or details..."
                  className="mt-1.5 min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!newTask.title.trim()}
            className="w-full sm:w-auto"
          >
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

CreateTaskDialog.displayName = 'CreateTaskDialog' 