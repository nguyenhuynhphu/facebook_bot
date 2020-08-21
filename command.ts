
let roles = require("./roles.ts");
module.exports = class Command {
    static handelHelp(){
        return {
            "text": `
              Các lệnh được sử dụng:
      @start: bắt đầu kết nối với bot
      @newgame: bắt đầu một game mới với phòng hiện tại
      @endgame: kết thúc game ngay lập tức
      @role_xx: xx là mã của vai trò, sẽ giúp các bạn biết về vai trò của thẻ
      @role_all: tất cả các vai trò của game
      @help: bộ các lệnh được sử dụng \n
            `}
    }

    static handelRoleAll(){
        let tmp = "";
        roles.forEach((role) =>{
            tmp += `${role.id}_${role.name}\n`
        })
        return {
            "text": tmp
        };
    }

    static handelNewGame(){

    }
}