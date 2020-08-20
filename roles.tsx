const data = [
    {
        id: 1,
        name: "Dân làng",
        description: "Không có tính năng đặc biệt nào cả, ngủ suốt đêm và tham gia biểu quyết tìm Sói vào ban ngày."
    },
    {
        id: 2,
        name: "Tiên tri",
        description: `Vào Ban Đêm, Tiên tri sẽ được Bot gọi dậy và có quyền đoán trước ai là Ma sói bằng cách chọn một người chơi. Nếu đúng, Bot sẽ trả lời Sói, nếu không phải Bot sẽ trả lời "Không phải" `
    },
    {
        id: 3,
        name: "Bảo vệ",
        description: "Mỗi đêm Bot sẽ gọi Bảo vệ. Nhiệm vụ của Bảo vệ là lựa 1 chọn người để cứu, Bảo vệ có thể chọn tự cứu mình. Người được Bảo vệ cứu nếu như bị Ma sói cắn thì vẫn sẽ sống sót vào sáng hôm sau. Nhưng Bảo vệ không được cứu 1 người liên tiếp 2 lượt chơi."
    },
    {
        id: 4,
        name: "Thợ săn",
        description: `Mỗi đêm, Thợ săn cũng sẽ được gọi dậy và chọn 1 người chơi để "bắn". Trong trường hợp Thợ săn bị Ma sói cắn chết, người được Thợ săn lựa chọn cũng sẽ chết theo.  Nếu người mà Thợ Săn chọn chết trong đêm thì Thợ Săn sẽ không chết theo. Nếu Thợ săn bị treo cổ vào ban ngày thì có quyền chọn 1 người để cùng bị treo cổ chung.`
    },
    {
        id: 5,
        name: "Phù Thủy",
        description: `Nhân vật này sở hữu 2 lọ thuốc, 1 lọ dùng cứu người và 1 lọ dùng để giết người. Ban đêm, Phù Thủy được gọi dậy và Quản trò sẽ chỉ ra ai là người bị Ma sói cắn, Phù Thủy có quyền chọn cứu người đó hoặc không. Ngoài ra, Phù thủy có thể dùng lọ thuốc độc để giết chết người mà mình nghi là Ma sói. Có thể sử dụng 1 lúc cả 2 lọ thuốc, khi đó tác dụng của thuốc sẽ mất. Một khi đã dùng bình thì Phù Thủy sẽ mất đi chức năng tương ứng, tuy nhiên vẫn được gọi dậy mỗi đêm và biết ai chết.`
    },
    {
        id: 6,
        name: "Sói thường",
        description: `Người chọn trúng lá bài là Sói thường có nhiệm vụ mỗi đêm sẽ được gọi dậy và làm thịt 1 người dân. Điểm thú vị chính là ma sói có thể chọn không cắn ai hoặc tự tàn sát lẫn nhau.`
    },
]

module.exports = data;