import {
  FiToggleLeft,
  FiList,
  FiActivity,
  FiCalendar,
  FiStar,
  FiDroplet,
  FiGrid,
  FiClock,
  FiCopy,
  FiUser,
  FiPieChart,
  FiCompass,
  FiHelpCircle,
  FiShoppingCart,
  FiHome
} from 'react-icons/fi'

const initialState = [
  {
    title: 'Applications',
    items: [
      {
        url: '/themes/dashboard',
        icon: <FiCompass size={20} />,
        title: 'Dashboard',
        items: []
      },
      {
        url: '/',
        icon: <FiCompass size={20} />,
        title: 'Knowledge Base',
        items: [
          {
            url: '/dashboard/exams',
            title: 'exams',
            items: []
          },
          {
            url: '/dashboard/courses',
            title: 'courses',
            items: []
          },
        ]
      },
      {
        url: '/',
        icon: <FiCompass size={20} />,
        title: 'Settings',
        items: [
          {
            url: '/dashboard/modules',
            title: 'modules',
            items: []
          },
        ]
      },
      {
        url: '/themes/',
        icon: <FiActivity size={20} />,
        title: 'Apps',
        items: [
          {
            url: '/themes/social-feed',
            title: 'Social feed',
            items: []
          },
          {
            url: '/themes/tasks',
            title: 'Tasks',
            items: []
          },
          {
            url: '/themes/inbox',
            title: 'Inbox',
            items: []
          },
          {
            url: '/themes/kanban',
            title: 'Kanban',
            items: []
          },
          {
            url: '/themes/todo',
            title: 'Todo',
            items: []
          },
          {
            url: '/themes/containers/app',
            title: 'Todo',
            items: []
          }
        ]
      },
      {
        url: '/themes/',
        icon: <FiList size={20} />,
        title: 'Menu levels',
        items: Array.from(Array(4).keys()).map((i) => {
          return {
            url: '/themes/',
            title: `Level 1-${i + 1}`,
            items: Array.from(Array(4).keys()).map((j) => {
              return {
                url: '/themes/',
                title: `Level 2-${j + 1}`,
                items: Array.from(Array(4).keys()).map((k) => {
                  return {
                    url: '/themes/',
                    title: `Level 3-${k + 1}`,
                    items: Array.from(Array(4).keys()).map((l) => {
                      return {
                        url: '/themes/',
                        title: `Level 4-${l + 1}`,
                        items: []
                      }
                    })
                  }
                })
              }
            })
          }
        })
      },
      {
        url: '/themes/',
        icon: <FiStar size={20} />,
        title: 'Demos',
        badge: {
          color: 'bg-indigo-500 text-white',
          text: 6
        },
        items: [
          {
            url: '/themes/demo-1',
            title: 'Light background',
            items: []
          },
          {
            url: '/themes/demo-2',
            title: 'Dark background',
            items: []
          },
          {
            url: '/themes/demo-4',
            title: 'Dark sidebar',
            items: []
          },
          {
            url: '/themes/demo-3',
            title: 'Small sidebar',
            items: []
          },
          {
            url: '/themes/demo-5',
            title: 'Dark small sidebar',
            items: []
          },
          {
            url: '/themes/demo-6',
            title: 'Dark navbar',
            items: []
          }
        ]
      },
      {
        url: '/themes/',
        icon: <FiShoppingCart size={20} />,
        title: 'E-commerce',
        items: [
          {
            url: '/themes/e-commerce',
            title: 'Products',
            items: []
          },
          {
            url: '/themes/invoice',
            title: 'Invoice',
            items: []
          },
          {
            url: '/themes/pricing-tables',
            title: 'Pricing tables',
            items: []
          }
        ]
      }
    ]
  },
  {
    title: 'components/functional-ui',
    items: [
      {
        url: '/themes/',
        icon: <FiDroplet size={20} />,
        title: 'UI Elements',
        items: [
          {
            url: '/themes/badges',
            title: 'Badges',
            items: []
          },
          {
            url: '/themes/breadcrumbs',
            title: 'Breadcrumbs',
            items: []
          },
          {
            url: '/themes/buttons',
            title: 'Buttons',
            items: []
          },
          {
            url: '/themes/dropdowns',
            title: 'Dropdowns',
            items: []
          },
          {
            url: '/themes/images',
            title: 'Images',
            items: []
          },
          {
            url: '/themes/lists',
            title: 'Lists',
            items: []
          },
          {
            url: '/themes/progress-bars',
            title: 'Progress bars',
            items: []
          },
          {
            url: '/themes/pagination',
            title: 'Pagination',
            items: []
          },
          {
            url: '/themes/tabs',
            title: 'Tabs',
            items: []
          },
          {
            url: '/themes/typography',
            title: 'Typography',
            items: []
          }
        ]
      },
      {
        url: '/themes/',
        icon: <FiCalendar size={20} />,
        title: 'Forms',
        badge: {
          color: 'bg-indigo-500 text-white',
          text: 6
        },
        items: [
          {
            url: '/themes/default-forms',
            title: 'Default forms',
            items: []
          },
          {
            url: '/themes/sample-forms',
            title: 'Sample forms',
            items: []
          },
          {
            url: '/themes/sliders',
            title: 'Sliders',
            items: []
          },
          {
            url: '/themes/datepicker',
            title: 'Date picker',
            items: []
          },
          {
            url: '/themes/switches',
            title: 'Switches',
            items: []
          },
          {
            url: '/themes/steps',
            title: 'Form steps',
            items: []
          },
          {
            url: '/themes/validation',
            title: 'Form validation',
            items: []
          }
        ]
      },
      {
        url: '/themes/',
        icon: <FiGrid size={20} />,
        title: 'Tables',
        items: [
          {
            url: '/themes/default-tables',
            title: 'Default tables',
            items: []
          },
          {
            url: '/themes/datatables',
            title: 'Datatables',
            items: []
          }
        ]
      },
      {
        url: '/themes/',
        icon: <FiClock size={20} />,
        title: 'Notifications',
        badge: {
          color: 'bg-indigo-500 text-white',
          text: 2
        },
        items: [
          {
            url: '/themes/alerts',
            title: 'Alerts',
            items: []
          },
          {
            url: '/themes/notifications',
            title: 'Notifications',
            items: []
          },
          {
            url: '/themes/modals',
            title: 'Modals',
            items: []
          },
          {
            url: '/themes/popovers',
            title: 'Popovers',
            items: []
          },
          {
            url: '/themes/tooltips',
            title: 'Tooltips',
            items: []
          }
        ]
      }
    ]
  },
  {
    title: 'Pages',
    items: [
      {
        url: '/themes/',
        icon: <FiCopy size={20} />,
        title: 'Authentication',
        badge: {
          color: 'bg-indigo-500 text-white',
          text: 7
        },
        items: [
          {
            url: '/themes/contact-us-1',
            title: 'Contact us',
            items: []
          },
          {
            url: '/themes/login-1',
            title: 'Login 1',
            items: []
          },
          {
            url: '/themes/login-2',
            title: 'Login 2',
            items: []
          },
          {
            url: '/themes/login-3',
            title: 'Login 3',
            items: []
          },
          {
            url: '/themes/create-account',
            title: 'Create account',
            items: []
          },
          {
            url: '/themes/email-confirmation',
            title: 'Email confirmation',
            items: []
          },
          {
            url: '/themes/logout',
            title: 'Logout',
            items: []
          },
          {
            url: '/themes/reset-password',
            title: 'Reset password',
            items: []
          },
          {
            url: '/themes/forgot-password',
            title: 'Forgot password',
            items: []
          },
          {
            url: '/themes/lock-screen',
            title: 'Lock screen',
            items: []
          },
          {
            url: '/themes/subscribe',
            title: 'Subscribe',
            items: []
          }
        ]
      },
      {
        url: '/themes/',
        icon: <FiUser size={20} />,
        title: 'User',
        items: [
          {
            url: '/themes/user-profile',
            title: 'User profile',
            items: []
          },
          {
            url: '/themes/social-feed',
            title: 'Social feed',
            items: []
          }
        ]
      },
      {
        url: '/themes/',
        icon: <FiClock size={20} />,
        title: 'Pages',
        items: [
          {
            url: '/themes/support-1',
            title: 'Support',
            items: []
          },
          {
            url: '/themes/empty-page',
            title: 'Empty page',
            items: []
          },
          {
            url: '/themes/terms-of-service',
            title: 'Terms of service',
            items: []
          },
          {
            url: '/themes/privacy-policy',
            title: 'Privacy policy',
            items: []
          },
          {
            url: '/themes/error-page',
            title: 'Error page',
            items: []
          },
          {
            url: '/themes/coming-soon',
            title: 'Coming soon',
            items: []
          }
        ]
      }
    ]
  },
  {
    title: 'Other',
    items: [
      {
        url: '/themes/',
        icon: <FiPieChart size={20} />,
        title: 'Charts',
        badge: {
          color: 'bg-indigo-500 text-white',
          text: 4
        },
        items: [
          {
            url: '/themes/bar-charts',
            title: 'Bar charts',
            items: []
          },
          {
            url: '/themes/line-charts',
            title: 'Line and area charts',
            items: []
          },
          {
            url: '/themes/pie-charts',
            title: 'Pie and doughnut charts',
            items: []
          },
          {
            url: '/themes/other-charts',
            title: 'Other charts',
            items: []
          }
        ]
      },
      {
        url: '/themes/',
        icon: <FiToggleLeft size={20} />,
        title: 'Icons',
        items: [
          {
            url: '/themes/react-icons',
            title: 'React icons',
            items: []
          },
          {
            url: '/themes/country-flags',
            title: 'Country flags',
            items: []
          }
        ]
      }
    ]
  },
  {
    title: 'Docs',
    items: [
      {
        url: '/themes/documentation',
        icon: <FiHelpCircle size={20} />,
        title: 'Documentation',
        items: []
      }
    ]
  },
  {
    title: 'Intro',
    items: [
      {
        url: '/themes/landing',
        icon: <FiHome size={20} />,
        title: 'Home page',
        items: []
      }
    ]
  }
]

export default function navigation(state = initialState, action) {
  if(action){
    switch (action.type) {
      default:
        return state
    }
  }else{
    return state
  }
}
