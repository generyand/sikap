import React from 'react'
import { format } from 'date-fns'
import { Task, TaskStatus, TaskPriority, TaskCategory } from '@prisma/client'
import { cn } from '@/lib/utils'
import { 
  SheetContent, SheetHeader, SheetTitle 
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import { categoryColorMap, priorityColorMap } from '@/lib/taskUtils'

interface TaskDetailProps {
  task: Task | null
  isEditing: boolean
  editTask: Partial<Task> | null
  onEdit: () => void
  onCancelEdit: () => void
  onSave: () => void
  onDelete: (id: string) => void
  onStatusChange: (status: TaskStatus) => void
  onEditTaskChange: (updates: Partial<Task>) => void
  onClose: () => void
}

export const TaskDetail = React.memo(({
  task,
  isEditing,
  editTask,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onStatusChange,
  onEditTaskChange,
  onClose
}: TaskDetailProps) => {
  if (!task) return null

  return (
    <SheetContent className="sm:max-w-md md:max-w-lg custom-scrollbar overflow-y-auto" onCloseAutoFocus={onClose}>
      <SheetHeader>
        <SheetTitle className="flex items-center justify-between">
          {isEditing ? 'Edit Task' : 'Task Details'}
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onCancelEdit}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={onSave}
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Title & Description */}
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium">Title</Label>
                <Input
                  id="edit-title"
                  value={editTask?.title || ''}
                  onChange={(e) => onEditTaskChange({ title: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editTask?.description || ''}
                  onChange={(e) => onEditTaskChange({ description: e.target.value || null })}
                  className="mt-1.5 min-h-[100px]"
                />
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium">{task.title}</h3>
              {task.description && (
                <p className="text-muted-foreground">{task.description}</p>
              )}
            </>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Status</h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(TaskStatus).map(status => (
              <Badge
                key={status}
                variant={task.status === status ? "default" : "outline"}
                className={cn(
                  "cursor-pointer",
                  isEditing && "hover:bg-primary/80"
                )}
                onClick={() => isEditing && onEditTaskChange({ status })}
              >
                {status.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-medium">Dates</h4>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="datetime-local"
                  value={editTask?.startDate ? new Date(editTask.startDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null
                    onEditTaskChange({ startDate: date })
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Due Date</Label>
                <Input
                  type="datetime-local"
                  value={editTask?.dueDate ? new Date(editTask.dueDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null
                    onEditTaskChange({ dueDate: date })
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p>{task.startDate ? format(new Date(task.startDate), 'MMM d, yyyy h:mm a') : 'Not set'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p>{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy h:mm a') : 'Not set'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Priority & Category */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-medium">Details</h4>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Priority</Label>
                <Select
                  value={editTask?.priority || TaskPriority.MEDIUM}
                  onValueChange={(value) => onEditTaskChange({ priority: value as TaskPriority })}
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
                  value={editTask?.category || ''}
                  onValueChange={(value) => onEditTaskChange({ 
                    category: value as TaskCategory || null 
                  })}
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
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Priority</p>
                <Badge 
                  className={cn(
                    "text-xs font-medium",
                    priorityColorMap[task.priority].badge
                  )}
                >
                  {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Category</p>
                {task.category ? (
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs",
                    categoryColorMap[task.category].bg,
                    categoryColorMap[task.category].text,
                    categoryColorMap[task.category].border
                  )}>
                    {React.createElement(categoryColorMap[task.category].icon, { className: "h-3.5 w-3.5" })}
                    <span>
                      {task.category.charAt(0) + task.category.slice(1).toLowerCase()}
                    </span>
                  </div>
                ) : (
                  <p>Not set</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-medium">Notes</h4>
          {isEditing ? (
            <Textarea
              value={editTask?.notes || ''}
              onChange={(e) => onEditTaskChange({ 
                notes: e.target.value || null 
              })}
              placeholder="Add any additional notes..."
              className="min-h-[100px]"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {task.notes || 'No notes added'}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Created</span>
            <span>{format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Updated</span>
            <span>{format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}</span>
          </div>
          {task.completedAt && (
            <div className="flex justify-between">
              <span>Completed</span>
              <span>{format(new Date(task.completedAt), 'MMM d, yyyy h:mm a')}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="destructive" 
            size="sm"
            className="gap-2"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Task
          </Button>
          
          {!isEditing && (
            <Button 
              variant={task.status === TaskStatus.COMPLETED ? "outline" : "default"}
              size="sm"
              className="gap-2"
              onClick={() => onStatusChange(
                task.status === TaskStatus.COMPLETED 
                  ? TaskStatus.TODO 
                  : TaskStatus.COMPLETED
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              {task.status === TaskStatus.COMPLETED ? 'Mark Incomplete' : 'Mark Complete'}
            </Button>
          )}
        </div>
      </div>
    </SheetContent>
  )
})

TaskDetail.displayName = 'TaskDetail' 