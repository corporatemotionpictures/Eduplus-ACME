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
    FiHome,
    FiBook,
    FiSettings,
    FiFolder,
    FiArchive,
    FiLayers,
    FiUserCheck,
    FiLayout,
    FiUsers,
    FiPackage,
    FiUserPlus,
    FiMessageSquare,
    FiVideo,
    FiCommand,
    FiBarChart,
} from 'react-icons/fi'


const Icon = (icon) => {


    var iconUpdate = '';
    switch (icon.icon) {
        case 'FiVideo': {
            return <FiVideo size={20}></FiVideo>
            break;
        }
        case 'FiCommand': {
            return <FiCommand size={20}></FiCommand>
            break;
        }
        case 'FiMessageSquare': {
            return <FiMessageSquare size={20}></FiMessageSquare>
            break;
        }
        case 'FiLayers': {
            return <FiLayers size={20}></FiLayers>
            break;
        }
        case 'FiUsers': {
            return <FiUsers size={20}></FiUsers>
            break;
        }
        case 'FiPackage': {
            return <FiPackage size={20}></FiPackage>
            break;
        }
        case 'FiUserPlus': {
            return <FiUserPlus size={20}></FiUserPlus>
            break;
        }
        case 'FiArchive': {
            return <FiArchive size={20}></FiArchive>
            break;
        }
        case 'FiFolder': {
            return <FiFolder size={20}></FiFolder>
            break;
        }
        case 'FiCompass': {
            return <FiCompass size={20}></FiCompass>
            break;
        }
        case 'FiToggleLeft': {
            return <FiToggleLeft size={20}></FiToggleLeft>
            break;
        }
        case 'FiList': {
            return <FiList size={20}></FiList>
            break;
        }
        case 'FiActivity': {
            return <FiActivity size={20}></FiActivity>
            break;
        }
        case 'FiCalendar': {
            return <FiCalendar size={20}></FiCalendar>
            break;
        }
        case 'FiStar': {
            return <FiStar size={20}></FiStar>
            break;
        }
        case 'FiUserCheck': {
            return <FiUserCheck size={20}></FiUserCheck>
            break;
        }
        case 'FiClock': {
            return <FiClock size={20}></FiClock>
            break;
        }
        case 'FiGrid': {
            return <FiGrid size={20}></FiGrid>
            break;
        }
        case 'FiCopy': {
            return <FiCopy size={20}></FiCopy>
            break;
        }
        case 'FiUser': {
            return <FiUser size={20}></FiUser>
            break;
        }
        case 'FiPieChart': {
            return <FiPieChart size={20}></FiPieChart>
            break;
        }
        case 'FiLayout': {
            return <FiLayout size={20}></FiLayout>
            break;
        }
        case 'FiUser': {
            return <FiUser size={20}></FiUser>
            break;
        }
        case 'FiHelpCircle': {
            return <FiHelpCircle size={20}></FiHelpCircle>
            break;
        }
        case 'FiShoppingCart': {
            return <FiShoppingCart size={20}></FiShoppingCart>
            break;
        }
        case 'FiHome': {
            return <FiHome size={20}></FiHome>
            break;
        }
        case 'FiBook': {
            return <FiBook size={20}></FiBook>
            break;
        }
        case 'FiSettings': {
            return <FiSettings size={20}></FiSettings>
            break;
        }
        case 'FiBarChart': {
            return <FiBarChart size={20}></FiBarChart>
            break;
        }
        default: {
            return ''
            break;
        }
    }
}

export default Icon