import { TaskStatus, TaskPriority, TaskCategory, RecurrencePattern, TaskCreationAttributes, ProfileAttributes } from './types';
import Profile from './models/profile.model';
import Task from './models/task.model';
import { hash } from 'bcrypt';

const taskTitles = [
  'Complete project presentation',
  'Review monthly reports',
  'Schedule team meeting',
  'Update documentation',
  'Client presentation preparation',
  'Gym workout session',
  'Grocery shopping',
  'Doctor appointment',
  'Online course completion',
  'Budget review',
  'Home maintenance',
  'Car service',
  'Read new book',
  'Plan weekend trip',
  'Submit tax documents',
  'Team building event',
  'Product launch preparation',
  'Website update',
  'Social media content creation',
  'Inventory check',
  'Staff training session',
  'Quarterly review meeting',
  'Marketing campaign planning',
  'Customer feedback analysis',
  'System maintenance',
  'New feature testing',
  'Security audit',
  'Performance optimization',
  'Database backup',
  'Code review',
  'Bug fixing',
  'User interface update',
  'API documentation',
  'Deployment planning',
  'Quality assurance testing',
  'Client onboarding',
  'Project milestone review',
  'Resource allocation',
  'Risk assessment',
  'Compliance check',
  'Vendor meeting',
  'Product demo preparation',
  'Sales report analysis',
  'Customer support training',
  'Market research',
  'Competitor analysis',
  'Brand strategy meeting',
  'Content calendar planning',
  'SEO optimization',
  'Analytics review'
];

const taskDescriptions = [
  'Prepare and present the final project presentation to stakeholders',
  'Review and analyze monthly performance reports',
  'Schedule and organize the upcoming team meeting',
  'Update project documentation with latest changes',
  'Prepare materials for client presentation',
  'Complete 1-hour workout session at the gym',
  'Purchase groceries for the week',
  'Attend scheduled doctor appointment',
  'Complete the next module of the online course',
  'Review and update monthly budget',
  'Perform regular home maintenance tasks',
  'Schedule and attend car service appointment',
  'Read the next chapter of the current book',
  'Plan details for the upcoming weekend trip',
  'Prepare and submit tax documents',
  'Organize team building event',
  'Prepare for upcoming product launch',
  'Update website content and features',
  'Create social media content for the week',
  'Conduct inventory check and update records',
  'Prepare and conduct staff training session',
  'Schedule and prepare for quarterly review',
  'Plan upcoming marketing campaign',
  'Analyze and compile customer feedback',
  'Perform system maintenance tasks',
  'Test new feature implementation',
  'Conduct security audit',
  'Optimize system performance',
  'Perform database backup',
  'Review and provide feedback on code changes',
  'Fix reported bugs',
  'Update user interface components',
  'Update API documentation',
  'Plan system deployment',
  'Conduct QA testing',
  'Prepare client onboarding materials',
  'Review project milestones',
  'Allocate resources for upcoming tasks',
  'Conduct risk assessment',
  'Perform compliance check',
  'Schedule and attend vendor meeting',
  'Prepare product demo materials',
  'Analyze sales reports',
  'Conduct customer support training',
  'Perform market research',
  'Analyze competitor strategies',
  'Plan brand strategy meeting',
  'Create content calendar',
  'Optimize website for SEO',
  'Review analytics data'
];

const categories = Object.values(TaskCategory);
const priorities = Object.values(TaskPriority);
const statuses = Object.values(TaskStatus);
const recurrencePatterns = Object.values(RecurrencePattern);

const generateRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedDatabase = async () => {
  try {
    // Create a test user
    const hashedPassword = await hash('Test@123', 10);
    const user = await Profile.create({
      name: 'Test User',
      password: hashedPassword,
      theme: 'system'
    });

    const userData = user.get() as ProfileAttributes;
    const userId = userData.id;

    // Create 50 tasks
    const tasks: TaskCreationAttributes[] = [];
    const startDate = new Date('2025-02-01');
    const endDate = new Date('2025-04-30');

    for (let i = 0; i < 50; i++) {
      const taskStartDate = generateRandomDate(startDate, endDate);
      const taskDueDate = new Date(taskStartDate);
      taskDueDate.setDate(taskDueDate.getDate() + Math.floor(Math.random() * 14) + 1);

      const isCompleted = Math.random() > 0.5;
      const completedAt = isCompleted ? generateRandomDate(taskStartDate, taskDueDate) : null;

      // Generate a random creation date
      const createdAt = generateRandomDate(startDate, taskStartDate);

      tasks.push({
        title: taskTitles[i],
        description: taskDescriptions[i],
        startDate: taskStartDate,
        dueDate: taskDueDate,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: isCompleted ? TaskStatus.COMPLETED : statuses[Math.floor(Math.random() * (statuses.length - 1))],
        profileId: userId,
        category: categories[Math.floor(Math.random() * categories.length)],
        recurrence: Math.random() > 0.7 ? recurrencePatterns[Math.floor(Math.random() * recurrencePatterns.length)] : null,
        notes: `Additional notes for ${taskTitles[i]}`,
        completedAt,
        createdAt
      });
    }

    await Task.bulkCreate(tasks);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

export default seedDatabase; 