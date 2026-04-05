Hospital Management System   **Tài liệu Bổ Sung: Đặc tả Yêu cầu Phần mềm (SRS)**

**HOSPITAL MANAGEMENT SYSTEM**

Hệ thống Quản lý Bệnh viện

**TÀI LIỆU BỔ SUNG**

**Đặc tả Yêu cầu Phần mềm — Module Internal Clinical Assistant**

*Software Requirements Specification (SRS)*

Phiên bản: 1.0  |  Module: Internal Clinical Assistant  |  2026


# **1. Tổng Quan Module**
## **1.1 Mục tiêu**
Xây dựng một trợ lý hội thoại nội bộ dành cho nhân sự y tế và vận hành, có khả năng tra cứu thông tin bệnh nhân và tài liệu nội bộ bằng mô hình `Graph RAG`, đồng thời đảm bảo phân quyền chặt chẽ, truy vết đầy đủ, và không làm ảnh hưởng tới chatbot public hiện có.

## **1.2 Phạm vi**
Module này áp dụng cho khu vực nội bộ đã đăng nhập của HMS và không thay thế chatbot public. Module bao gồm:
- Tra cứu dữ liệu bệnh nhân trong phạm vi được cấp quyền.
- Tra cứu tài liệu nội bộ như SOP, guideline, policy, workflow.
- Hợp nhất câu trả lời từ dữ liệu cấu trúc của HMS và knowledge graph nội bộ.
- Cung cấp citation, deep link, conversation memory dài phiên, feedback loop, và audit log.

## **1.3 Ngoài phạm vi**
- Không hỗ trợ public user.
- Không hỗ trợ chẩn đoán mới ngoài dữ liệu đã lưu.
- Không tự động thay đổi hồ sơ, lịch hẹn, đơn thuốc hoặc dữ liệu vận hành.
- Không tìm kiếm internet hoặc nguồn tri thức bên ngoài ở v1.


# **2. Đối Tượng Sử Dụng**
|**Người dùng**|**Role**|**Phạm vi sử dụng assistant**|
| :- | :- | :- |
|Bác sĩ|DOCTOR|Tra cứu hồ sơ bệnh nhân theo ngữ cảnh được phép + tra cứu tài liệu nội bộ|
|Y tá|NURSE|Tra cứu hồ sơ bệnh nhân theo ngữ cảnh được phép + nạp/hỗ trợ nạp tài liệu, hồ sơ liên quan vào hệ thống + tra cứu tài liệu nội bộ|
|Admin|ADMIN|Tra cứu tài liệu nội bộ ở v1; ở phase 2 chỉ được xem dữ liệu bệnh nhân khi có selected patient context rõ ràng|

## **2.1 Nguyên tắc phân quyền**
- `DOCTOR` và `NURSE` có quyền truy cập dữ liệu bệnh nhân trong phạm vi bệnh nhân đang được mở ngữ cảnh hoặc nằm trong workflow được phép của vai trò đó.
- `ADMIN` ở v1 chỉ được dùng `docs mode`.
- `ADMIN` ở phase 2 chỉ được truy cập dữ liệu bệnh nhân theo `selected patient only`, không được hỏi đáp dạng quét toàn hệ thống.
- Tất cả kiểm tra quyền phải được thực thi ở backend, UI chỉ có vai trò hỗ trợ điều hướng và giảm thao tác sai.


# **3. Mô Tả Nghiệp Vụ**
## **3.1 Tách biệt với chatbot public**
- Chatbot public tiếp tục phục vụ thông tin bệnh viện, bác sĩ, lịch rảnh và hướng dẫn đặt lịch.
- Internal Clinical Assistant là module riêng, chỉ xuất hiện trong khu vực nội bộ, có endpoint và policy riêng.

## **3.2 Mô hình tri thức**
Module sử dụng hai lớp tri thức:

### **Lớp dữ liệu bệnh nhân (Clinical Graph)**
- Patient → Appointment → Medical Record → Prescription / PDF → Lab Result → Portal Message.
- Dùng dữ liệu cấu trúc hiện có trong database HMS.
- Không đưa PHI vào vector index ở v1.

### **Lớp tài liệu nội bộ (Knowledge Graph)**
- Document → Section / Chunk → Entity / Concept → Relation.
- Áp dụng cho SOP, quy trình, hướng dẫn chuyên môn, policy vận hành, tài liệu đào tạo nội bộ.
- Hỗ trợ Graph RAG để tìm các đoạn tài liệu liên quan và quan hệ giữa các khái niệm.


# **4. Yêu Cầu Chức Năng**
## **4.1 Phạm vi hiển thị**
- Assistant phải xuất hiện tại các màn hình nội bộ có ngữ cảnh nghiệp vụ rõ ràng.
- Tối thiểu phải hỗ trợ:
  - Màn hình Patient Records Management
  - Màn hình Medical Record Editor
  - Shortcut mở từ Doctor Dashboard
- Assistant không được gắn vào khu vực public site.

## **4.2 Chế độ truy vấn**
Assistant phải hỗ trợ tối thiểu 3 chế độ:

### **Docs Mode**
- Chỉ tra cứu knowledge base nội bộ.
- Áp dụng cho `DOCTOR`, `NURSE`, `ADMIN`.

### **Patient Mode**
- Chỉ tra cứu dữ liệu bệnh nhân trong ngữ cảnh được phép.
- Áp dụng cho `DOCTOR` và `NURSE`.
- Không khả dụng cho `ADMIN` ở v1.

### **Hybrid Mode**
- Kết hợp dữ liệu bệnh nhân và tài liệu nội bộ trong cùng một câu trả lời.
- Áp dụng cho `DOCTOR` và `NURSE`.
- Nếu một trong hai nguồn không đủ dữ liệu thì assistant phải nêu rõ phần nào được trả lời, phần nào bị thiếu bằng chứng.

## **4.3 Ngữ cảnh bệnh nhân**
- `patientId` hoặc `appointmentId` phải được gửi từ UI khi truy vấn `patient` hoặc `hybrid`.
- Hệ thống không cho phép hỏi bệnh nhân theo kiểu tìm quét toàn hệ thống qua assistant.
- Nếu thiếu ngữ cảnh bệnh nhân hợp lệ, assistant phải từ chối.

## **4.4 Tra cứu dữ liệu bệnh nhân**
Assistant phải có khả năng trả lời các loại câu hỏi sau trong phạm vi được phép:
- Tóm tắt hồ sơ bệnh nhân hiện tại.
- Lịch sử các lần khám liên quan.
- Chẩn đoán đã lưu.
- Ghi chú lâm sàng đã lưu.
- Đơn thuốc gần nhất và thông tin thuốc đã kê.
- PDF đơn thuốc hoặc metadata liên quan.
- Kết quả xét nghiệm và nhận xét bác sĩ.
- Lịch tái khám đã lên kế hoạch.
- Message thread hoặc trao đổi liên quan trong patient portal.

## **4.5 Tra cứu tài liệu nội bộ**
Assistant phải có khả năng trả lời các loại câu hỏi sau:
- SOP hoàn tất hồ sơ khám.
- Quy trình nhắc lịch tái khám.
- Quy trình xử lý lab results.
- Hướng dẫn tương tác với patient portal.
- Policy vận hành, quy trình nghiệp vụ, và guideline nội bộ đã được upload/phê duyệt.

## **4.6 Graph RAG Retrieval**
- Hệ thống phải lưu knowledge documents, chunks, entities, edges và ingestion state.
- Retrieval phải tận dụng:
  - text match / lexical search
  - concept/entity match
  - graph relation expansion
  - ranking theo relevance
- Hệ thống phải cho phép mở rộng thêm semantic retrieval/vector similarity sau mà không phá vỡ API hiện tại.

## **4.7 Định dạng request**
Assistant phải hỗ trợ request tối thiểu gồm:
- `message`
- `mode`
- `patientId` (optional)
- `appointmentId` (optional)
- `conversation` (optional)

## **4.8 Định dạng response**
Assistant phải trả về tối thiểu:
- `answer`
- `citations[]`
- `deepLinks[]`
- `suggestions[]`
- `scope`

## **4.9 Citation và explainability**
- Mọi câu trả lời hợp lệ phải có ít nhất 1 citation.
- Nếu không có citation, hệ thống phải trả về `refused`.
- Citation phải chứa tối thiểu:
  - tên nguồn
  - loại nguồn
  - excerpt hoặc mô tả ngắn
  - reference id
  - deep link nếu có
- Với câu trả lời hybrid, hệ thống phải phân biệt rõ nguồn đến từ hồ sơ bệnh nhân và nguồn đến từ tài liệu nội bộ.

## **4.10 Refusal behavior**
Assistant phải từ chối trong các trường hợp sau:
- Không có đủ bằng chứng.
- Câu hỏi vượt phạm vi quyền truy cập.
- Câu hỏi yêu cầu chẩn đoán mới hoặc tư vấn điều trị ngoài dữ liệu đã lưu.
- Thiếu patient context cho truy vấn `patient` hoặc `hybrid`.
- `ADMIN` dùng `patient mode` trong v1.

## **4.11 Conversation memory dài phiên**
- Assistant phải lưu conversation memory trong suốt phiên làm việc nội bộ.
- Conversation memory phải hỗ trợ câu hỏi follow-up có phụ thuộc ngữ cảnh trước đó.
- Khi người dùng đổi patient context, hệ thống phải reset hoặc tách session memory tương ứng để tránh rò rỉ ngữ cảnh giữa hai bệnh nhân.
- Conversation memory phải gắn với user session và context hiện tại.

## **4.12 Feedback loop**
- Mỗi câu trả lời phải hỗ trợ feedback tối thiểu:
  - Helpful
  - Not helpful
- Hệ thống phải lưu feedback để phục vụ cải thiện ranking, nội dung tài liệu và chất lượng câu trả lời về sau.
- Feedback không được làm thay đổi câu trả lời hiện tại theo thời gian thực ở v1.

## **4.13 Knowledge base administration**
Hệ thống phải có màn hình quản trị knowledge base để:
- Upload tài liệu nội bộ.
- Gắn category / tag / status cho tài liệu.
- Kích hoạt hoặc revoke tài liệu.
- Re-index tài liệu.
- Xem ingestion state.
- Xem tài liệu nào đang được assistant sử dụng làm nguồn.

## **4.14 Vai trò của y tá**
- `NURSE` có quyền tra cứu dữ liệu bệnh nhân tương tự `DOCTOR` trong phạm vi nghiệp vụ được phép.
- `NURSE` là vai trò vận hành chính để đưa tài liệu, hồ sơ hoặc thông tin liên quan đến bệnh nhân vào hệ thống theo quy trình được phê duyệt.
- Các thao tác nạp tài liệu của `NURSE` phải được audit.

## **4.15 Vai trò của admin ở phase 2**
- Phase 2 cho phép `ADMIN` truy cập dữ liệu bệnh nhân qua assistant chỉ khi UI đã chọn rõ một bệnh nhân cụ thể.
- `ADMIN` không được phép dùng assistant để liệt kê hoặc quét hàng loạt bệnh nhân.
- Mọi truy vấn selected-patient-only của `ADMIN` phải có audit log chi tiết hơn mức bình thường.

## **4.16 Audit logging**
Mọi truy vấn assistant phải được ghi audit log với tối thiểu:
- user id
- role
- mode
- scope trả lời
- patientId / appointmentId nếu có
- citations được dùng
- outcome (`completed`, `refused`, `forbidden`, `insufficient_evidence`, v.v.)
- timestamp

## **4.17 Deep link**
Assistant phải cho phép deep link ngược về:
- patient records screen
- medical record editor
- doctor dashboard context
- knowledge document/chunk tương ứng


# **5. Quy Tắc Nghiệp Vụ**
## **5.1 Read-only**
- Assistant là read-only ở v1.
- Assistant không được tạo, sửa, xóa appointment, patient, medical record, invoice, hoặc bất kỳ thực thể vận hành nào.

## **5.2 Tối thiểu hóa dữ liệu**
- Assistant chỉ được truy cập đúng lượng dữ liệu cần cho câu trả lời.
- Không trả về toàn bộ hồ sơ nếu câu hỏi chỉ cần một phần nhỏ.

## **5.3 Không suy diễn ngoài dữ liệu**
- Assistant không được phát sinh chẩn đoán hoặc y lệnh mới không có trong medical record đã lưu.
- Assistant chỉ được diễn giải trong giới hạn của dữ liệu hiện có và tài liệu nội bộ đã phê duyệt.

## **5.4 Context isolation**
- Không được mang ngữ cảnh của bệnh nhân A sang câu trả lời cho bệnh nhân B.
- Không được dùng conversation memory cũ nếu user đã đổi patient context.


# **6. Yêu Cầu Phi Chức Năng (NFR)**
## **6.1 Bảo mật**
- Tất cả endpoint assistant phải yêu cầu xác thực.
- Backend phải thực thi kiểm tra quyền trên mọi request.
- Assistant phải có rate limit riêng, tách biệt với chatbot public.
- PHI không được đưa vào vector index ở v1.
- Tài liệu nội bộ và dữ liệu bệnh nhân phải được xử lý trong boundary hạ tầng được kiểm soát.

## **6.2 Riêng tư dữ liệu**
- Hệ thống không được gửi dữ liệu bệnh nhân sang internet hoặc nguồn tri thức public.
- Log và audit metadata không được chứa raw PHI không cần thiết.
- Dữ liệu patient context phải chỉ hiển thị cho phiên hợp lệ của người dùng được cấp quyền.

## **6.3 Hiệu năng**
- P95 cho truy vấn `docs mode` không vượt quá 2 giây trong điều kiện tải chuẩn.
- P95 cho truy vấn `patient` hoặc `hybrid` không vượt quá 3 giây trong điều kiện tải chuẩn.
- Feedback và audit logging không được làm tăng latency đáng kể của response.

## **6.4 Độ tin cậy**
- Nếu knowledge retrieval lỗi, patient retrieval vẫn phải hoạt động độc lập nếu quyền hợp lệ.
- Nếu patient retrieval lỗi hoặc bị từ chối, docs mode vẫn phải hoạt động độc lập.
- Hệ thống phải degrade gracefully và trả lỗi có cấu trúc thay vì lỗi mơ hồ.

## **6.5 Khả năng giải thích**
- Tất cả câu trả lời thành công phải có citation.
- Người dùng phải nhìn thấy nguồn nào hỗ trợ câu trả lời.
- Với câu trả lời hybrid, hệ thống phải tách biệt rõ phần clinical data và phần knowledge doc.

## **6.6 Tính cập nhật**
- Dữ liệu bệnh nhân phải phản ánh gần real-time từ database nghiệp vụ.
- Knowledge base phải có version/timestamp ingestion để biết tài liệu đang dựa trên bản nào.

## **6.7 Khả năng mở rộng**
- Thiết kế phải hỗ trợ tăng số lượng tài liệu, chunk, node và edge mà không cần đổi contract API.
- Hệ thống phải hỗ trợ incremental re-index thay vì bắt buộc rebuild toàn bộ corpus.
- Kiến trúc phải cho phép bổ sung semantic/vector ranking mạnh hơn trong các phase sau.

## **6.8 Quan sát hệ thống**
Hệ thống phải có khả năng đo lường tối thiểu:
- số lượng truy vấn theo role
- latency theo mode
- refusal rate
- top cited documents
- authorization failures
- rate limit hits
- ingestion failures
- feedback helpful / not helpful rate

## **6.9 Bảo trì**
- Query router, access policy, patient retrieval, docs retrieval, answer synthesis và feedback handling phải được tách module rõ ràng.
- Mọi thay đổi schema knowledge base phải đi qua migration.
- Tài liệu knowledge phải có lifecycle rõ ràng: draft, active, revoked.

## **6.10 Tuân thủ**
- Module phải tuân thủ nguyên tắc tối thiểu hóa dữ liệu và truy cập theo nhu cầu công việc.
- Mọi truy vấn phải có khả năng truy vết để phục vụ kiểm tra nội bộ, bảo mật và tuân thủ.


# **7. Tiêu Chí Chấp Nhận**
- `DOCTOR` truy vấn đúng bệnh nhân đang mở và nhận câu trả lời có citation.
- `NURSE` truy vấn đúng bệnh nhân đang mở và nhận câu trả lời có citation.
- `ADMIN` dùng `docs mode` thành công.
- `ADMIN` dùng `patient mode` ở v1 bị từ chối.
- Không có câu trả lời thành công nào thiếu citation.
- Knowledge base admin có thể upload, activate, revoke tài liệu và xem ingestion state.
- Conversation memory theo phiên hoạt động đúng và không rò ngữ cảnh giữa hai bệnh nhân.
- Feedback helpful / not helpful được lưu thành công.
- Audit log ghi nhận đủ actor, role, mode, scope, context và outcome.


# **8. Ghi Chú Triển Khai**
- V1 ưu tiên retrieval an toàn, giải thích được và đúng quyền hơn là trả lời “thông minh” nhưng khó kiểm soát.
- Semantic/vector retrieval có thể được tăng cường sau, nhưng clinical patient data vẫn nên tiếp tục đi qua structured retrieval + relation traversal.
- Nếu cần hợp nhất vào tài liệu SRS tổng, module này có thể trở thành một chương riêng trong `HMS_SRS.md`.
