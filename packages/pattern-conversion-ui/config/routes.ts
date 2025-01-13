

export default [

  {
    path: '/',
    redirect: '/project',
  },
  {
    name: 'Project',
    path: '/project',
    exact: false,
    hideInMenu: false,
    component: './Project',
    icon: 'PieChartOutlined'
  },
  // {
  //   name: 'ToolOutlined',
  //   path: '/setup',
  //   exact: false,
  //   hideInMenu: false,
  //   component: './Setup',
  //   icon: 'FormOutlined'
  // },
  {
    name: 'Pattern',
    path: '/pattern',
    exact: false,
    hideInMenu: false,
    component: './Pattern',
    icon: 'SnippetsOutlined'
  },
  {
    name: 'Group Config',
    path: '/about',
    component: './Home',
    icon: 'FormOutlined',
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