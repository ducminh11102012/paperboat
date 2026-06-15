// Paper Boats — Dialogue & Localization Data
const STRINGS = {
    vi: {
        game_title: "Thuyền Giấy",
        game_subtitle: "Paper Boats",
        choose_language: "Chọn ngôn ngữ",
        btn_vietnamese: "Tiếng Việt",
        btn_english: "English",
        press_to_continue: "Nhấn để tiếp tục",
        press_space: "Nhấn SPACE hoặc click",
        chapter_1_title: "Chương 1 — Đến Làng",
        chapter_2_title: "Chương 2 — Những Ngày Mùa Hè",
        chapter_3_title: "Chương 3 — Vết Nứt",
        chapter_4a_title: "Chương 4 — Sự Thật",
        chapter_4b_title: "Chương 4 — Tạm Biệt",
        epilogue_title: "Mùa Thu Sau Nữa",
        ten_years_later: "Mười năm sau.",
        interact_hint: "[SPACE] Tương tác",
        move_hint: "Dùng phím mũi tên hoặc WASD để di chuyển",
    },
    en: {
        game_title: "Paper Boats",
        game_subtitle: "Thuyền Giấy",
        choose_language: "Choose language",
        btn_vietnamese: "Tiếng Việt",
        btn_english: "English",
        press_to_continue: "Click to continue",
        press_space: "Press SPACE or click",
        chapter_1_title: "Chapter 1 — The Village",
        chapter_2_title: "Chapter 2 — Summer Days",
        chapter_3_title: "Chapter 3 — The Crack",
        chapter_4a_title: "Chapter 4 — The Truth",
        chapter_4b_title: "Chapter 4 — Farewell",
        epilogue_title: "Another Autumn",
        ten_years_later: "Ten years later.",
        interact_hint: "[SPACE] Interact",
        move_hint: "Use arrow keys or WASD to move",
    }
};

const DIALOGUES = {
    vi: {
        // ===== CHAPTER 1 =====
        narr_intro: [
            { speaker: "", text: "Hà Nội, tháng 6 năm 1996.", portrait: "" },
            { speaker: "", text: "Bố mẹ tao vừa ly hôn.", portrait: "" },
            { speaker: "", text: "Tao về làng ở với bà Nội một mùa hè.", portrait: "" },
        ],
        ch1_arrive: [
            { speaker: "Bà Nội", text: "Cháu đây rồi! Đi đường có mệt không? Vào nhà bà nấu cơm cho.", portrait: "ba_noi_normal" },
            { speaker: "Minh", text: "Dạ, con không mệt lắm bà ạ.", portrait: "minh" },
            { speaker: "Bà Nội", text: "Để bà dẫn đi quanh xóm một vòng ha.", portrait: "ba_noi_normal" },
        ],
        ch1_tree: [
            { speaker: "Bà Nội", text: "Cây đa này lâu đời hơn bà nhiều. Đừng ra đây ban đêm nghe chưa.", portrait: "ba_noi_normal" },
        ],
        ch1_pond: [
            { speaker: "Bà Nội", text: "Mùa này sen vừa tàn. Năm ngoái đẹp lắm. Ra đó cẩn thận nước.", portrait: "ba_noi_normal" },
        ],
        ch1_temple: [
            { speaker: "Bà Nội", text: "Hội làng cuối hè. Cháu ở đủ lâu thì được xem.", portrait: "ba_noi_normal" },
        ],
        ch1_meet_thu_intro: [
            { speaker: "", text: "Tiếng hát vọng từ bờ ao...", portrait: "" },
            { speaker: "", text: "\"Con cò mà đi ăn đêm, đậu phải cành mềm lộn cổ xuống ao...\"", portrait: "" },
        ],
        ch1_meet_thu: [
            { speaker: "Thu", text: "Mày từ Hà Nội về à? Trông dở thế.", portrait: "thu_normal" },
            { speaker: "Thu", text: "Bắt ếch mà cứ nhìn xuống nước là không bao giờ bắt được đâu.", portrait: "thu_normal" },
        ],
        ch1_choice_1: {
            prompt: "",
            options: [
                { text: "Tao không định bắt ếch.", next: "ch1_choice_1a" },
                { text: "Tao biết cách bắt.", next: "ch1_choice_1b" },
            ]
        },
        ch1_choice_1a: [
            { speaker: "Thu", text: "Vậy thì làm gì ra đây?", portrait: "thu_normal" },
            { speaker: "Thu", text: "Thôi, để tao chỉ cho. Ngồi xuống đi.", portrait: "thu_normal" },
        ],
        ch1_choice_1b: [
            { speaker: "Thu", text: "(cười) Thì bắt đi. Tao xem.", portrait: "thu_normal" },
            { speaker: "Thu", text: "...Thôi, để tao chỉ lại cho. Mày bắt sai hết rồi.", portrait: "thu_normal" },
        ],
        ch1_after_choice: [
            { speaker: "Minh", text: "Mày tên gì?", portrait: "minh" },
            { speaker: "Thu", text: "Thu. Tao tên Thu.", portrait: "thu_normal" },
            { speaker: "Minh", text: "Tao tên Minh. Mày ở đây lâu chưa?", portrait: "minh" },
            { speaker: "Thu", text: "Lâu rồi. Rất lâu rồi.", portrait: "thu_normal" },
        ],
        ch1_seed1: [
            { speaker: "Minh", text: "Về ăn cơm với tao không?", portrait: "minh" },
            { speaker: "Thu", text: "Thôi. Tao no rồi.", portrait: "thu_normal" },
            { speaker: "Minh", text: "Mày ăn gì mà no?", portrait: "minh" },
            { speaker: "Thu", text: "(quay đi) Ăn... ổi. Lúc nãy.", portrait: "thu_normal" },
        ],
        ch1_unease: [
            { speaker: "Bà Nội", text: "Nãy cháu đứng ngoài bờ ao nói chuyện với ai thế?", portrait: "ba_noi_normal" },
            { speaker: "Minh", text: "Bạn con. Con bé áo hoa.", portrait: "minh" },
            { speaker: "Bà Nội", text: "...Ừ. Tối rồi, vào ăn cơm.", portrait: "ba_noi_normal" },
        ],

        // ===== CHAPTER 2 =====
        ch2_fireflies_start: [
            { speaker: "Thu", text: "Ra đây. Tao chỉ cho cái này.", portrait: "thu_normal" },
            { speaker: "", text: "Thu đưa ra một cái lọ thủy tinh.", portrait: "" },
            { speaker: "Thu", text: "Bắt đom đóm đi! Bắt cho tao 5 con.", portrait: "thu_normal" },
        ],
        ch2_fireflies_end: [
            { speaker: "Thu", text: "Người ta nói đom đóm là hồn của những đứa trẻ.", portrait: "thu_normal" },
            { speaker: "Minh", text: "Đứa trẻ nào?", portrait: "minh" },
            { speaker: "Thu", text: "(dừng) Không biết. Bà tao kể vậy.", portrait: "thu_normal" },
        ],
        ch2_boats: [
            { speaker: "Minh", text: "Mày biết gấp thuyền giấy không?", portrait: "minh" },
            { speaker: "Thu", text: "Biết. Tao gấp được.", portrait: "thu_normal" },
            { speaker: "", text: "Thu lúi húi gấp... Ra một cục nhàu nát.", portrait: "" },
            { speaker: "Thu", text: "Cái giấy của mày xấu lắm mới không được.", portrait: "thu_normal" },
            { speaker: "Minh", text: "Giấy tao thì liên quan gì...", portrait: "minh" },
            { speaker: "Thu", text: "Liên quan. Giấy tốt gấp mới ra hình. Giấy mày dở.", portrait: "thu_normal" },
        ],
        ch2_boats_choice: {
            prompt: "",
            options: [
                { text: "Dạy Thu gấp lại", next: "ch2_boats_teach", memory: "mem_boat" },
                { text: "Thôi, kệ đi", next: "ch2_boats_skip" },
            ]
        },
        ch2_boats_teach: [
            { speaker: "Minh", text: "Đưa đây, tao chỉ lại cho.", portrait: "minh" },
            { speaker: "", text: "Minh cầm tay Thu, hướng dẫn từng nếp gấp.", portrait: "" },
            { speaker: "Thu", text: "(im lặng, chăm chú)", portrait: "thu_normal" },
            { speaker: "", text: "Chiếc thuyền vẫn hơi méo, nhưng nó nổi được.", portrait: "" },
            { speaker: "Thu", text: "...Xấu thôi. Nhưng tao gấp được.", portrait: "thu_normal" },
        ],
        ch2_boats_skip: [
            { speaker: "Minh", text: "Kệ đi, thả cái của tao nè.", portrait: "minh" },
            { speaker: "", text: "Hai đứa nhìn chiếc thuyền trôi xa.", portrait: "" },
        ],
        ch2_jealousy: [
            { speaker: "Minh", text: "Chiều tao đi câu với thằng Bắp nhé.", portrait: "minh" },
            { speaker: "Thu", text: "(im một lúc) Thì đi đi.", portrait: "thu_normal" },
            { speaker: "Minh", text: "Mày không đi cùng à?", portrait: "minh" },
            { speaker: "Thu", text: "Tao không thèm.", portrait: "thu_normal" },
        ],
        ch2_jealousy_after: [
            { speaker: "", text: "Minh về thì Thu đã ngồi chỗ cũ. Không xin lỗi, không nhắc lại.", portrait: "" },
            { speaker: "Thu", text: "(như không có gì) Hôm nay tao thấy con ếch to lắm ở bờ ao.", portrait: "thu_normal" },
        ],
        ch2_wish: [
            { speaker: "", text: "Dưới gốc đa có bát hương cũ và miếu nhỏ. Trên cành buộc nhiều dải vải đỏ đã bạc.", portrait: "" },
            { speaker: "", text: "Thu chỉ một dải vải, chữ trẻ con xiêu vẹo:", portrait: "" },
            { speaker: "", text: "\"Con muốn ở lại làng mãi mãi. Đừng bắt con đi.\"", portrait: "" },
            { speaker: "Minh", text: "Mày ước điều này à?", portrait: "minh" },
            { speaker: "Thu", text: "Ừ. Tao ước. Và người ta đã cho tao ở lại.", portrait: "thu_normal" },
            { speaker: "Minh", text: "Vậy mày vui không?", portrait: "minh" },
            { speaker: "Thu", text: "(nhìn dải vải, không nhìn Minh)", portrait: "thu_normal" },
            { speaker: "Thu", text: "Vui. Nhưng cô đơn lắm. Cho đến khi mày đến.", portrait: "thu_normal" },
        ],
        ch2_ghost_festival: [
            { speaker: "", text: "Đêm Rằm tháng Bảy. Bà Nội thắp hương ngoài ngõ, rải cháo, đốt vàng mã.", portrait: "" },
            { speaker: "Minh", text: "Bà làm gì vậy?", portrait: "minh" },
            { speaker: "Bà Nội", text: "Cúng cô hồn. Rằm tháng Bảy, những người chết chưa về được thì lang thang. Mình cúng để họ đỡ đói, đỡ lạnh.", portrait: "ba_noi_normal" },
            { speaker: "", text: "Bà vào nhà. Minh nhìn chỗ Thu hay ngồi.", portrait: "" },
            { speaker: "", text: "Tối om. Không có ai.", portrait: "" },
        ],
        ch2_ghost_festival_after: [
            { speaker: "", text: "Hôm sau Thu lại xuất hiện, vui vẻ như thường.", portrait: "" },
            { speaker: "Thu", text: "Hôm qua mày đi đâu mà tao không thấy?", portrait: "thu_normal" },
        ],
        ch2_silence: [
            { speaker: "Minh", text: "Nếu ba mày gọi về sớm thì sao?", portrait: "minh" },
            { speaker: "Thu", text: "(im lặng dài) Vậy mày đi đi.", portrait: "thu_normal" },
            { speaker: "Minh", text: "Tao nói \"nếu\" thôi. Chưa có gì—", portrait: "minh" },
            { speaker: "Thu", text: "Tao biết.", portrait: "thu_normal" },
            { speaker: "", text: "Thu bỏ đi. Hôm sau bình thường. Không bao giờ nhắc lại.", portrait: "" },
        ],

        // ===== CHAPTER 3 =====
        ch3_grave: [
            { speaker: "", text: "Gần gốc đa, lệch khỏi đường chính. Một bia đá cũ, chữ mờ:", portrait: "" },
            { speaker: "", text: "Nguyễn Thị Thu · 1984 – 1994", portrait: "" },
            { speaker: "", text: "...", portrait: "" },
        ],
        ch3_notebook: [
            { speaker: "", text: "Trên kệ sách cũ, một cuốn sổ cầu nguyện của bà.", portrait: "" },
            { speaker: "", text: "Gần cuối, một dòng viết tay:", portrait: "" },
            { speaker: "", text: "\"Nguyễn Thị Thu — sinh 1984, mất tháng 8 năm 1994 — mùa lũ.\"", portrait: "" },
        ],
        ch3_ongtu: [
            { speaker: "", text: "Ông Tư ngồi đúng chỗ Minh hay chơi với Thu.", portrait: "" },
            { speaker: "Ông Tư", text: "Cháu chờ ai ở đây?", portrait: "ong_tu" },
            { speaker: "Minh", text: "Chờ Thu. Bạn con.", portrait: "minh" },
            { speaker: "Ông Tư", text: "(im lặng dài) ...Áo hoa nhỏ?", portrait: "ong_tu" },
            { speaker: "Minh", text: "Ông biết cô bé đó à?", portrait: "minh" },
            { speaker: "Ông Tư", text: "Con sông đó. Mùa lũ năm 94...", portrait: "ong_tu" },
        ],
        ch3_ongtu_cine: [
            { speaker: "", text: "Ông Tư nhìn xuống nước. Im lặng rất lâu.", portrait: "" },
            { speaker: "Ông Tư", text: "Cháu về nhà đi.", portrait: "ong_tu" },
            { speaker: "", text: "Ông đứng dậy, bỏ đi. Chỉ còn tiếng nước chảy.", portrait: "" },
        ],

        // ===== CHAPTER 4A =====
        ch4a_truth: [
            { speaker: "Minh", text: "Bà ơi. Thu là...", portrait: "minh" },
            { speaker: "Bà Nội", text: "(im lặng dài, không ngạc nhiên) Ừ. Bà biết cháu thấy nó.", portrait: "ba_noi_normal" },
            { speaker: "Bà Nội", text: "Thu là con nuôi nhà ông Hùng đầu xóm.", portrait: "ba_noi_normal" },
            { speaker: "Bà Nội", text: "Bố mẹ ruột nó bỏ vào Nam từ khi nó còn đỏ hỏn.", portrait: "ba_noi_normal" },
            { speaker: "Bà Nội", text: "Nó biết mình là con nuôi. Sợ nhất là bị trả về trại.", portrait: "ba_noi_normal" },
            { speaker: "Bà Nội", text: "Năm 94. Mùa lũ về sớm. Nó chạy ra sông...", portrait: "ba_noi_normal" },
        ],
        ch4a_truth_cine: [
            { speaker: "Bà Nội", text: "(rất nhỏ) Ông Tư kéo nó lên. Ở khúc dưới.", portrait: "ba_noi_crying" },
            { speaker: "Bà Nội", text: "Bà không hỏi cháu giận bà không.", portrait: "ba_noi_crying" },
            { speaker: "Bà Nội", text: "Bà hỏi cháu có tiếc mùa hè này không.", portrait: "ba_noi_crying" },
        ],
        ch4a_confront: [
            { speaker: "", text: "Gốc đa. Thu đang hát ca dao con cò.", portrait: "" },
            { speaker: "Minh", text: "Mày... mày là...", portrait: "minh" },
            { speaker: "Thu", text: "Ừ.", portrait: "thu_sad" },
            { speaker: "", text: "(im lặng dài)", portrait: "" },
            { speaker: "Minh", text: "Sao mày không nói?", portrait: "minh" },
            { speaker: "Thu", text: "Mày có bỏ đi không?", portrait: "thu_sad" },
            { speaker: "", text: "(Minh không trả lời. Thu cũng không cần.)", portrait: "" },
            { speaker: "Thu", text: "Đó. Tao sợ vậy đó.", portrait: "thu_sad" },
        ],

        // ===== CHAPTER 4B =====
        ch4b_never_had: [
            { speaker: "Thu", text: "Mày biết tao chưa bao giờ được vào hội làng không?", portrait: "thu_sad" },
            { speaker: "Thu", text: "Mỗi năm tao đứng ngoài nhìn vào.", portrait: "thu_sad" },
            { speaker: "Minh", text: "Tại sao không vào?", portrait: "minh" },
            { speaker: "Thu", text: "(im lặng) Người ta không thấy tao.", portrait: "thu_sad" },
        ],
        ch4b_ask_grandma: [
            { speaker: "Minh", text: "Bà ơi. Con muốn dẫn Thu vào hội.", portrait: "minh" },
            { speaker: "", text: "Bà im lặng dài. Gật đầu. Lau mắt. Không nói gì.", portrait: "" },
        ],
        ch4b_festival_gate: [
            { speaker: "Thu", text: "Mày... mày có chắc không?", portrait: "thu_sad" },
            { speaker: "Minh", text: "Ừ.", portrait: "minh" },
            { speaker: "", text: "Họ bước vào cùng nhau. Đèn lồng nhiều màu.", portrait: "" },
        ],
        ch4b_ongtu_sorry: [
            { speaker: "", text: "Bà Nội và ông Tư ở đó. Lần đầu sau hai năm, họ cho phép mình nhìn lại.", portrait: "" },
            { speaker: "Ông Tư", text: "(chắp tay) Thu ơi. Ông xin lỗi con. Ông không kịp.", portrait: "ong_tu" },
            { speaker: "Bà Nội", text: "(cầm tay Thu) Con đã ở lại đủ lâu rồi. Con xứng đáng được nghỉ.", portrait: "ba_noi_normal" },
        ],
        ch4b_farewell: [
            { speaker: "Thu", text: "Mày có nhớ tao không?", portrait: "thu_real_smile" },
            { speaker: "", text: "(Minh gật đầu.)", portrait: "" },
            { speaker: "Thu", text: "Vậy là đủ rồi.", portrait: "thu_real_smile" },
        ],

        // ===== LETTER =====
        letter: [
            "Gửi người nào đó chưa biết tao là ai,",
            "",
            "Nếu mày đọc cái này, có nghĩa là mày đã thấy tao.",
            "Và có nghĩa là tao không cô đơn nữa.",
            "",
            "Tao biết tao là ma từ lâu rồi.",
            "Tao nhớ lúc chết. Tao nhớ nước lạnh.",
            "",
            "Nhưng tao không muốn đi.",
            "Không phải vì sợ chết —",
            "mà vì tao chưa bao giờ có ai nhớ tao cả.",
            "",
            "Khi mày đến, tao định không nói gì hết.",
            "Nhưng mày cứ hỏi, cứ cười, cứ rủ tao đi chơi,",
            "như thể tao thật sự tồn tại.",
            "",
            "Tao xin lỗi vì không nói sớm hơn.",
            "Tao ích kỷ. Tao sợ mày bỏ đi.",
            "",
            "Nhưng mày biết rồi mà vẫn không bỏ.",
            "Mày đã cho tao tham gia hội làng lần đầu tiên.",
            "Giờ tao có thể đi rồi. Không sợ bị quên nữa.",
            "",
            "Mùa hè của chúng mình ngắn lắm.",
            "Nhưng tao sẽ giữ nó mãi mãi.",
            "Mày cũng vậy nha.",
            "",
            "— Thu",
        ],
        letter_ps_default: "P/S: Mày hát ca dao dở lắm. Nhưng tao thích nghe.",
        letter_ps_boat: "P/S: Tao gấp được thuyền giấy rồi đó. Xấu thôi. Nhưng tao gấp được.",
        letter_thanks_all: "Cảm ơn mày đã nhớ hết mọi thứ.",

        // song choice
        ch2_song_choice: {
            prompt: "",
            options: [
                { text: "Hát cùng Thu", next: "ch2_sing_together", memory: "mem_song" },
                { text: "Chỉ ngồi nghe", next: "ch2_just_listen" },
            ]
        },
        ch2_sing_together: [
            { speaker: "", text: "Minh hát theo, giọng lạc phách. Thu cười phá lên.", portrait: "" },
            { speaker: "Thu", text: "Mày hát dở quá! Nhưng... hát tiếp đi.", portrait: "thu_normal" },
        ],
        ch2_just_listen: [
            { speaker: "", text: "Minh ngồi nghe. Giọng Thu vang trong đêm hè.", portrait: "" },
        ],
        ch2_song_intro: [
            { speaker: "", text: "Thu bắt đầu hát nhỏ bên bờ ao.", portrait: "" },
            { speaker: "", text: "\"Con cò mà đi ăn đêm...\"", portrait: "" },
        ],
    },
    en: {
        narr_intro: [
            { speaker: "", text: "Hanoi, June 1996.", portrait: "" },
            { speaker: "", text: "My parents just divorced.", portrait: "" },
            { speaker: "", text: "I spent the summer with my grandmother in the village.", portrait: "" },
        ],
        ch1_arrive: [
            { speaker: "Grandma", text: "You're here! Tired from the trip? Come, I'll cook for you.", portrait: "ba_noi_normal" },
            { speaker: "Minh", text: "I'm okay, grandma.", portrait: "minh" },
            { speaker: "Grandma", text: "Let me show you around the village.", portrait: "ba_noi_normal" },
        ],
        ch1_tree: [
            { speaker: "Grandma", text: "This banyan tree is older than me. Don't come here at night.", portrait: "ba_noi_normal" },
        ],
        ch1_pond: [
            { speaker: "Grandma", text: "The lotus just wilted this season. Last year was beautiful. Be careful near the water.", portrait: "ba_noi_normal" },
        ],
        ch1_temple: [
            { speaker: "Grandma", text: "The village festival is at the end of summer. Stay long enough and you'll see it.", portrait: "ba_noi_normal" },
        ],
        ch1_meet_thu_intro: [
            { speaker: "", text: "A singing voice drifts from the pond...", portrait: "" },
            { speaker: "", text: "\"The stork that hunts at night, landing on a fragile branch, tumbles into the pond...\"", portrait: "" },
        ],
        ch1_meet_thu: [
            { speaker: "Thu", text: "You're from Hanoi? You look so hopeless.", portrait: "thu_normal" },
            { speaker: "Thu", text: "Staring at the water like that — you'll never catch anything.", portrait: "thu_normal" },
        ],
        ch1_choice_1: {
            prompt: "",
            options: [
                { text: "I'm not trying to catch frogs.", next: "ch1_choice_1a" },
                { text: "I know how to catch them.", next: "ch1_choice_1b" },
            ]
        },
        ch1_choice_1a: [
            { speaker: "Thu", text: "Then what are you doing out here?", portrait: "thu_normal" },
            { speaker: "Thu", text: "Fine, let me teach you. Sit down.", portrait: "thu_normal" },
        ],
        ch1_choice_1b: [
            { speaker: "Thu", text: "(laughs) Go ahead then. I'll watch.", portrait: "thu_normal" },
            { speaker: "Thu", text: "...Okay, let me show you properly. You're doing it all wrong.", portrait: "thu_normal" },
        ],
        ch1_after_choice: [
            { speaker: "Minh", text: "What's your name?", portrait: "minh" },
            { speaker: "Thu", text: "Thu. My name is Thu.", portrait: "thu_normal" },
            { speaker: "Minh", text: "I'm Minh. Have you been here long?", portrait: "minh" },
            { speaker: "Thu", text: "A long time. A very long time.", portrait: "thu_normal" },
        ],
        ch1_seed1: [
            { speaker: "Minh", text: "Want to come eat dinner with me?", portrait: "minh" },
            { speaker: "Thu", text: "No. I'm full.", portrait: "thu_normal" },
            { speaker: "Minh", text: "What did you eat?", portrait: "minh" },
            { speaker: "Thu", text: "(looks away) Guava... earlier.", portrait: "thu_normal" },
        ],
        ch1_unease: [
            { speaker: "Grandma", text: "Who were you talking to out by the pond?", portrait: "ba_noi_normal" },
            { speaker: "Minh", text: "A friend. A girl in a floral shirt.", portrait: "minh" },
            { speaker: "Grandma", text: "...Mm. It's late, come eat.", portrait: "ba_noi_normal" },
        ],
        ch2_fireflies_start: [
            { speaker: "Thu", text: "Come here. I'll show you something.", portrait: "thu_normal" },
            { speaker: "", text: "Thu holds out a glass jar.", portrait: "" },
            { speaker: "Thu", text: "Catch fireflies! Get me 5.", portrait: "thu_normal" },
        ],
        ch2_fireflies_end: [
            { speaker: "Thu", text: "People say fireflies are the souls of children.", portrait: "thu_normal" },
            { speaker: "Minh", text: "Which children?", portrait: "minh" },
            { speaker: "Thu", text: "(pauses) Don't know. My grandma told me.", portrait: "thu_normal" },
        ],
        ch2_boats: [
            { speaker: "Minh", text: "Do you know how to fold paper boats?", portrait: "minh" },
            { speaker: "Thu", text: "Of course. I can do it.", portrait: "thu_normal" },
            { speaker: "", text: "Thu fumbles with the paper... producing a crumpled mess.", portrait: "" },
            { speaker: "Thu", text: "It's your paper. Bad paper.", portrait: "thu_normal" },
            { speaker: "Minh", text: "How is it the paper's fault...", portrait: "minh" },
            { speaker: "Thu", text: "It is. Good paper folds properly. Your paper is bad.", portrait: "thu_normal" },
        ],
        ch2_boats_choice: {
            prompt: "",
            options: [
                { text: "Teach Thu to fold", next: "ch2_boats_teach", memory: "mem_boat" },
                { text: "Never mind", next: "ch2_boats_skip" },
            ]
        },
        ch2_boats_teach: [
            { speaker: "Minh", text: "Here, let me show you.", portrait: "minh" },
            { speaker: "", text: "Minh takes Thu's hands, guiding each fold.", portrait: "" },
            { speaker: "Thu", text: "(silent, focused)", portrait: "thu_normal" },
            { speaker: "", text: "The boat is still a bit crooked, but it floats.", portrait: "" },
            { speaker: "Thu", text: "...An ugly one. But I can do it.", portrait: "thu_normal" },
        ],
        ch2_boats_skip: [
            { speaker: "Minh", text: "Forget it, let's float mine.", portrait: "minh" },
            { speaker: "", text: "They watch the boat drift away.", portrait: "" },
        ],
        ch2_jealousy: [
            { speaker: "Minh", text: "I'm going fishing with Bap this afternoon.", portrait: "minh" },
            { speaker: "Thu", text: "(long pause) Then go.", portrait: "thu_normal" },
            { speaker: "Minh", text: "You're not coming?", portrait: "minh" },
            { speaker: "Thu", text: "I don't want to.", portrait: "thu_normal" },
        ],
        ch2_jealousy_after: [
            { speaker: "", text: "When Minh returns, Thu is sitting in her usual spot. No apology. No mention of it.", portrait: "" },
            { speaker: "Thu", text: "(as if nothing happened) I saw a really big frog by the pond today.", portrait: "thu_normal" },
        ],
        ch2_wish: [
            { speaker: "", text: "Under the banyan tree: an old incense bowl and a small shrine. Red cloth strips hang from branches, faded by time.", portrait: "" },
            { speaker: "", text: "Thu points to one strip, with a child's crooked handwriting:", portrait: "" },
            { speaker: "", text: "\"I want to stay in the village forever. Don't make me leave.\"", portrait: "" },
            { speaker: "Minh", text: "You wished for this?", portrait: "minh" },
            { speaker: "Thu", text: "Yes. I wished. And they let me stay.", portrait: "thu_normal" },
            { speaker: "Minh", text: "Are you happy?", portrait: "minh" },
            { speaker: "Thu", text: "(looking at the cloth, not at Minh)", portrait: "thu_normal" },
            { speaker: "Thu", text: "Happy. But so lonely. Until you came.", portrait: "thu_normal" },
        ],
        ch2_ghost_festival: [
            { speaker: "", text: "Ghost Festival night. Grandma lights incense outside, scatters rice porridge, burns spirit money.", portrait: "" },
            { speaker: "Minh", text: "What are you doing, grandma?", portrait: "minh" },
            { speaker: "Grandma", text: "Offerings for wandering souls. On Ghost Festival, those who can't return... they wander. We offer so they're less hungry, less cold.", portrait: "ba_noi_normal" },
            { speaker: "", text: "Grandma goes inside. Minh looks at Thu's usual spot.", portrait: "" },
            { speaker: "", text: "Pitch dark. No one there.", portrait: "" },
        ],
        ch2_ghost_festival_after: [
            { speaker: "", text: "The next day, Thu appears again, cheerful as always.", portrait: "" },
            { speaker: "Thu", text: "Where were you yesterday? I didn't see you.", portrait: "thu_normal" },
        ],
        ch2_silence: [
            { speaker: "Minh", text: "What if your dad calls you back early?", portrait: "minh" },
            { speaker: "Thu", text: "(long silence) Then go.", portrait: "thu_normal" },
            { speaker: "Minh", text: "I said 'what if.' Nothing's happened—", portrait: "minh" },
            { speaker: "Thu", text: "I know.", portrait: "thu_normal" },
            { speaker: "", text: "Thu walks away. The next day, everything is normal. She never mentions it again.", portrait: "" },
        ],
        ch2_song_intro: [
            { speaker: "", text: "Thu begins to sing softly by the pond.", portrait: "" },
            { speaker: "", text: "\"The stork that hunts at night...\"", portrait: "" },
        ],
        ch2_song_choice: {
            prompt: "",
            options: [
                { text: "Sing along with Thu", next: "ch2_sing_together", memory: "mem_song" },
                { text: "Just sit and listen", next: "ch2_just_listen" },
            ]
        },
        ch2_sing_together: [
            { speaker: "", text: "Minh sings along, completely off-key. Thu bursts out laughing.", portrait: "" },
            { speaker: "Thu", text: "You sing terribly! But... keep going.", portrait: "thu_normal" },
        ],
        ch2_just_listen: [
            { speaker: "", text: "Minh sits and listens. Thu's voice fills the summer night.", portrait: "" },
        ],
        ch3_grave: [
            { speaker: "", text: "Near the banyan tree, off the main path. An old gravestone, faded text:", portrait: "" },
            { speaker: "", text: "Nguyễn Thị Thu · 1984 – 1994", portrait: "" },
            { speaker: "", text: "...", portrait: "" },
        ],
        ch3_notebook: [
            { speaker: "", text: "On the old bookshelf, grandmother's prayer notebook.", portrait: "" },
            { speaker: "", text: "Near the end, a handwritten line:", portrait: "" },
            { speaker: "", text: "\"Nguyễn Thị Thu — born 1984, died August 1994 — flood season.\"", portrait: "" },
        ],
        ch3_ongtu: [
            { speaker: "", text: "Old Tu sits exactly where Minh usually plays with Thu.", portrait: "" },
            { speaker: "Old Tu", text: "Who are you waiting for?", portrait: "ong_tu" },
            { speaker: "Minh", text: "Waiting for Thu. My friend.", portrait: "minh" },
            { speaker: "Old Tu", text: "(long silence) ...The little floral shirt?", portrait: "ong_tu" },
            { speaker: "Minh", text: "You know her?", portrait: "minh" },
            { speaker: "Old Tu", text: "That river. The flood. '94...", portrait: "ong_tu" },
        ],
        ch3_ongtu_cine: [
            { speaker: "", text: "Old Tu stares at the water. Silent for a very long time.", portrait: "" },
            { speaker: "Old Tu", text: "Go home, child.", portrait: "ong_tu" },
            { speaker: "", text: "He stands up and walks away. Only the sound of flowing water remains.", portrait: "" },
        ],
        ch4a_truth: [
            { speaker: "Minh", text: "Grandma. Thu is...", portrait: "minh" },
            { speaker: "Grandma", text: "(long silence, not surprised) Yes. I know you've been seeing her.", portrait: "ba_noi_normal" },
            { speaker: "Grandma", text: "Thu was an adopted child of the Hung family down the road.", portrait: "ba_noi_normal" },
            { speaker: "Grandma", text: "Her birth parents left for the South when she was still a baby.", portrait: "ba_noi_normal" },
            { speaker: "Grandma", text: "She knew she was adopted. Her biggest fear was being sent back to the orphanage.", portrait: "ba_noi_normal" },
            { speaker: "Grandma", text: "1994. The flood came early. She ran to the river...", portrait: "ba_noi_normal" },
        ],
        ch4a_truth_cine: [
            { speaker: "Grandma", text: "(very quietly) Old Tu pulled her out. Downstream.", portrait: "ba_noi_crying" },
            { speaker: "Grandma", text: "I'm not asking if you're angry at me.", portrait: "ba_noi_crying" },
            { speaker: "Grandma", text: "I'm asking if you regret this summer.", portrait: "ba_noi_crying" },
        ],
        ch4a_confront: [
            { speaker: "", text: "The banyan tree. Thu is singing the stork lullaby.", portrait: "" },
            { speaker: "Minh", text: "You... you're...", portrait: "minh" },
            { speaker: "Thu", text: "Yeah.", portrait: "thu_sad" },
            { speaker: "", text: "(Long silence.)", portrait: "" },
            { speaker: "Minh", text: "Why didn't you tell me?", portrait: "minh" },
            { speaker: "Thu", text: "Would you have left?", portrait: "thu_sad" },
            { speaker: "", text: "(Minh doesn't answer. Thu doesn't need him to.)", portrait: "" },
            { speaker: "Thu", text: "That. That's what I was afraid of.", portrait: "thu_sad" },
        ],
        ch4b_never_had: [
            { speaker: "Thu", text: "You know I've never been to the village festival?", portrait: "thu_sad" },
            { speaker: "Thu", text: "Every year I just watched from outside.", portrait: "thu_sad" },
            { speaker: "Minh", text: "Why not go in?", portrait: "minh" },
            { speaker: "Thu", text: "(silence) They can't see me.", portrait: "thu_sad" },
        ],
        ch4b_ask_grandma: [
            { speaker: "Minh", text: "Grandma. I want to take Thu to the festival.", portrait: "minh" },
            { speaker: "", text: "Grandma is silent for a long time. She nods. Wipes her eyes. Says nothing.", portrait: "" },
        ],
        ch4b_festival_gate: [
            { speaker: "Thu", text: "Are you... are you sure?", portrait: "thu_sad" },
            { speaker: "Minh", text: "Yes.", portrait: "minh" },
            { speaker: "", text: "They walk in together. Lanterns of every color.", portrait: "" },
        ],
        ch4b_ongtu_sorry: [
            { speaker: "", text: "Grandma and Old Tu are there. For the first time in two years, they allow themselves to see.", portrait: "" },
            { speaker: "Old Tu", text: "(hands clasped) Thu. I'm sorry, child. I wasn't fast enough.", portrait: "ong_tu" },
            { speaker: "Grandma", text: "(holds Thu's hand) You've stayed long enough. You deserve to rest.", portrait: "ba_noi_normal" },
        ],
        ch4b_farewell: [
            { speaker: "Thu", text: "Will you remember me?", portrait: "thu_real_smile" },
            { speaker: "", text: "(Minh nods.)", portrait: "" },
            { speaker: "Thu", text: "That's enough.", portrait: "thu_real_smile" },
        ],
        letter: [
            "To whoever doesn't know who I am yet,",
            "",
            "If you're reading this, it means you've seen me.",
            "And it means I'm not alone anymore.",
            "",
            "I've known I'm a ghost for a long time.",
            "I remember dying. I remember the cold water.",
            "",
            "But I didn't want to leave.",
            "Not because I'm afraid of death —",
            "but because no one has ever remembered me.",
            "",
            "When you came, I planned to say nothing.",
            "But you kept asking, kept laughing, kept inviting me to play,",
            "as if I truly existed.",
            "",
            "I'm sorry I didn't tell you sooner.",
            "I was selfish. I was afraid you'd leave.",
            "",
            "But you knew, and you still stayed.",
            "You took me to the festival for the first time.",
            "Now I can go. No longer afraid of being forgotten.",
            "",
            "Our summer was so short.",
            "But I'll keep it forever.",
            "You too, okay?",
            "",
            "— Thu",
        ],
        letter_ps_default: "P.S. You sing folk songs terribly. But I liked listening.",
        letter_ps_boat: "P.S. I can fold a paper boat now. An ugly one. But I can.",
        letter_thanks_all: "Thank you for remembering everything.",
    }
};
