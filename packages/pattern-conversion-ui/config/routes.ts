

export default [

  {
    path: '/',
    redirect: '/project',
  },
  {
    name: 'Project Dashboard',
    path: '/project',
    exact: false,
    hideInMenu: false,
    component: './Project',
    icon: 'PieChartOutlined'
  },
  {
    name: 'Setup',
    path: '/setup',
    exact: false,
    hideInMenu: false,
    component: './Setup',
    icon: 'ToolOutlined'
  },
  {
    name: 'About',
    path: '/about',
    component: './Home',
    icon: 'SnippetsOutlined',
  },

  {
    name: 'Account',
    path: '/admin',
    exact: false,
    icon: 'UsergroupDeleteOutlined',
    // component: './Access',
    access: 'canSeeAdmin',
    routes: [
      {
        name: 'User Management',
        path: '/admin/users',
        component: './Access',
      },
    ]
  },
  {
    path: '/create_project',
    name: 'Create Project',
    exact: true,
    hideInMenu: true,
    component: './Account/InitProject'
  },
  {
    name: 'Login',
    layout: false,
    path: '/login',
    exact: true,
    hideInMenu: true,
    component: './Account/Login'
  },
  {
    name: 'Profile',
    path: '/profile',
    exact: true,
    hideInMenu: true,
    component: './Account/Profile'
  },


]