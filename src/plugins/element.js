import Vue from 'vue'
import {
  Form, FormItem, Input, Button, Message,
  Container, Header, Main, Aside, Submenu,
  MenuItem, Menu, Breadcrumb, BreadcrumbItem,
  Card, Table, TableColumn, Col, Row,
  Dialog, Pagination, Upload, Drawer, Descriptions,
  DescriptionsItem, Checkbox, CheckboxGroup, Switch,
  TimePicker, DatePicker, Option, Radio, RadioGroup,
  MenuItemGroup, Select, Progress, Step, Steps, Tag,
  MessageBox, Dropdown, DropdownMenu, DropdownItem, Popover,
  Link
} from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// shift + alt + ⬆️
Vue.use(Link)
Vue.use(Popover)
Vue.use(DropdownItem)
Vue.use(DropdownMenu)
Vue.use(Dropdown)
Vue.use(Tag)
Vue.use(Step)
Vue.use(Steps)
Vue.use(Progress)
Vue.use(Select)
Vue.use(MenuItemGroup)
Vue.use(RadioGroup)
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Menu)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Row)
Vue.use(Col)
Vue.use(Dialog)
Vue.use(Pagination)
Vue.use(Upload)
Vue.use(Drawer)
Vue.use(Descriptions)
Vue.use(DescriptionsItem)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Switch)
Vue.use(TimePicker)
Vue.use(DatePicker)
Vue.use(Option)
Vue.use(Radio)

// 导入message消息弹出框
Vue.prototype.$message = Message
Vue.prototype.$msgbox = MessageBox
