

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
    path: '/project/:id/pattern',
    exact: false,
    hideInMenu: true,
    component: './Pattern',
    icon: 'SnippetsOutlined',
    // wrappers: ['@/wrappers/frontop'], // 添加前置钩子
  },

  {
    name: 'Help',
    path: '/help',
    component: './Help',
    icon: 'SunOutlined',
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
        component: './Account/UserManagement',
      },
      {
        name: 'Other Management',
        path: '/admin/other',
        component: './Admin',
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