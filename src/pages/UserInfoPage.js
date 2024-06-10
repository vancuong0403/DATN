
import { Helmet } from 'react-helmet';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';

function UserInfoPage({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login }) {
    return (
        <div>
            <Helmet>
                <title>Giới Thiệu</title>
            </Helmet>
            ContactUs
        </div>
    )
}
const mapStateToProps = (state) => ({
    isLogin: state.isLogin,
    fullName: state.fullName,
    avatarPath: state.avatarPath,
    permission: state.permission,
    viewtoken: state.viewtoken,
    isdefaultpasswd: state.isdefaultpasswd
});
const mapDispatchToProps = {
    login,
    logout
};

export default connect(mapStateToProps, mapDispatchToProps)(UserInfoPage);