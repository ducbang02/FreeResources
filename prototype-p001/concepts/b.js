/* P00.1 Concept B: task-led directory. All data and actions come from shared local primitives. */
window.Concepts = window.Concepts || {};
window.Concepts.B = (() => {
  const categories = [
    ['Văn phòng', 'work', 'Làm việc gọn hơn'],
    ['Học tập', 'book', 'Học một điều mới'],
    ['Sáng tạo', 'spark', 'Biến ý tưởng thành thật'],
    ['Lập trình', 'code', 'Xây dựng và thử nghiệm'],
    ['Bảo mật', 'check', 'Chủ động bảo vệ dữ liệu'],
    ['Giải trí', 'heart', 'Dành chỗ cho niềm vui']
  ];

  function rail(H, active = '') {
    return `<aside class="b-rail" aria-label="Chủ đề tài nguyên">
      <a class="b-rail-home ${!active ? 'is-active' : ''}" href="${H.url('discover')}">${H.symbol('grid')}<span>Tất cả tài nguyên</span><span class="b-count">${H.data.length}</span></a>
      <p class="b-rail-label">KHÁM PHÁ THEO NHU CẦU</p>
      <nav class="b-topics" aria-label="Nhu cầu">
        ${categories.map(([name, symbol, purpose]) => `<a href="${H.url('discover', { category: name })}" class="${active === name ? 'is-active' : ''}">${H.symbol(symbol)}<span>${H.escape(name)}<small>${H.escape(purpose)}</small></span></a>`).join('')}
      </nav>
      <div class="b-rail-divider"></div>
      <a class="b-rail-link" href="${H.url('saved')}">${H.symbol('bookmark')}Đã lưu trong phiên</a>
      <a class="b-rail-link" href="${H.url('collection/teach')}">${H.symbol('book')}Góc dành cho giáo viên</a>
      <div class="b-rail-note"><span class="b-note-dot" aria-hidden="true"></span><p>Ít đường vòng hơn.<br>Nhiều điều hữu ích hơn.</p><small>${H.data.length} tài nguyên fixture để thử giao diện. Chưa phải catalog đã kiểm duyệt.</small></div>
    </aside>`;
  }

  function home(H, s) {
    const localSend = H.get('localsend');
    const rated = H.data.filter(r => r.rating).slice(0, 3);
    return `${H.header('directory')}<main id="main" tabindex="-1" class="b-main"><div class="b-shell">
      ${rail(H)}
      <div class="b-content">
        <section class="b-intro"><div><p class="b-kicker">MỘT THƯ VIỆN CHO VIỆC HẰNG NGÀY</p><h1>Bạn cần làm gì hôm nay?</h1><p>Tìm công cụ phù hợp. Hiểu rõ trước khi dùng.</p></div><span class="b-edition">DIRECTORY<br><strong>01 / KHÁM PHÁ</strong></span></section>
        ${H.search('', 'b-home-search', 'Thử “chuyển file”, “soạn bài”, “vẽ sơ đồ”…')}
        <div class="b-quick" aria-label="Lối tắt theo nhu cầu"><span>Bắt đầu từ một việc nhỏ</span><a href="${H.url('discover', { q: 'file' })}">Chuyển tệp ${H.symbol('arrow')}</a><a href="${H.url('discover', { category: 'Học tập' })}">Học tập ${H.symbol('arrow')}</a><a href="${H.url('discover', { category: 'Văn phòng' })}">Văn phòng ${H.symbol('arrow')}</a></div>

        <div class="b-start-grid">
          <section class="b-feature" aria-labelledby="b-feature-title"><div class="b-feature-copy"><p class="b-kicker">MỘT CÔNG CỤ ĐỂ BẮT ĐẦU</p><div class="b-feature-id">${H.icon(localSend, 'md')}<h2 id="b-feature-title">LocalSend</h2></div><p>Chuyển tệp giữa các thiết bị.<br>Một việc nhỏ, bớt nhiều thao tác.</p><a class="b-inline-link" href="${H.url('detail/localsend')}">Tìm hiểu công cụ ${H.symbol('arrow')}</a></div><div class="b-feature-picture">${H.preview(localSend)}</div></section>
          <section class="b-rated" aria-labelledby="b-rated-title"><div class="b-mini-head"><h2 id="b-rated-title">Điểm mẫu nổi bật</h2><span>FIXTURE</span></div>${rated.length ? rated.map(r => H.row(r)).join('') : '<p class="b-muted">Chưa có dữ liệu đánh giá.</p>'}<a class="b-inline-link" href="${H.url('discover', { sort: 'rating' })}">Xem thứ tự điểm mẫu ${H.symbol('arrow')}</a></section>
        </div>

        <section class="b-section">${H.sectionHead('Công cụ đáng khám phá', 'Mỗi lựa chọn bắt đầu từ một công việc cụ thể.', H.url('discover'))}<div class="b-card-grid">${H.pick(['excalidraw', 'obs', 'keepassxc']).map(r => H.card(r, { compact: true })).join('')}</div></section>

        <div class="b-twin-sections">
          <section class="b-index-section">${H.sectionHead('Repo GitHub đáng xem', 'Mã nguồn là điểm bắt đầu, không phải bảo chứng an toàn.', H.url('discover', { kind: 'repo' }))}<div class="b-index">${H.pick(['godot', 'powertoys', 'vscode']).map(r => H.row(r)).join('')}</div></section>
          <section class="b-index-section">${H.sectionHead('Học tập, mở ra mỗi ngày', 'Tài nguyên miễn phí để thử học và khám phá.', H.url('discover', { kind: 'learn', price: 'Miễn phí' }))}<div class="b-index">${H.pick(['phet', 'freecodecamp', 'mdn']).map(r => H.row(r)).join('')}</div></section>
        </div>

        <section class="b-office-section">${H.sectionHead('Nhẹ việc văn phòng', 'Từ một tệp tài liệu đến một sơ đồ rõ ý.', H.url('discover', { category: 'Văn phòng' }))}<div class="b-card-grid">${H.pick(['libreoffice', 'drawio', 'localsend']).map(r => H.card(r, { compact: true })).join('')}</div></section>
        <section class="b-section b-collections">${H.sectionHead('Không biết bắt đầu từ đâu?', 'Đi cùng một bộ sưu tập theo việc bạn muốn làm.')} ${H.collections()}</section>
        <p class="b-data-note">Bản mẫu P00.1 · Tên ứng dụng có thật; mô tả, giá và điểm số chỉ phục vụ thử giao diện. Kiểm tra tại nguồn trước khi dùng.</p>
      </div>
    </div></main>${H.footer()}`;
  }

  function discover(H, s) {
    const active = s.params.get('category') || '';
    const list = s.params.get('view') === 'list';
    const params = Object.fromEntries(s.params);
    return `${H.header('directory')}<main id="main" tabindex="-1" class="b-main"><div class="b-shell b-discovery-shell">
      <aside class="b-filter-rail"><a class="b-back-link" href="${H.url('home')}">${H.symbol('chevron')}Về trang chủ</a><details class="b-filter-disclosure" open><summary>${H.symbol('filter')}Thu gọn lựa chọn<span>${H.symbol('chevron')}</span></summary><div class="b-filter-content">${H.filters(s)}</div></details><div class="b-filter-tip"><p class="b-kicker">TÌM THEO VIỆC CẦN LÀM</p><p>Không cần biết tên phần mềm. Hãy thử một tác vụ như “ghi màn hình” hoặc “vẽ sơ đồ”.</p></div></aside>
      <div class="b-content"><section class="b-discover-heading"><p class="b-kicker">THƯ VIỆN TÀI NGUYÊN</p><h1>${s.query ? 'Tìm đúng điều bạn cần.' : active ? H.escape(active) : 'Có một công cụ cho việc đó.'}</h1><p>Khám phá ứng dụng, repo và tài nguyên học tập trong cùng một nơi.</p></section>
      ${H.search(s.query, 'b-discover-search', 'Tìm theo tên, công dụng hoặc nhu cầu…')}
      <div class="b-results-toolbar">${H.resultsHead(s)}<nav class="b-view-toggle" aria-label="Cách hiển thị kết quả"><a href="${H.url('discover', { ...params, view: 'grid' })}" class="${!list ? 'is-active' : ''}" ${!list ? 'aria-current="true"' : ''} aria-label="Hiển thị dạng lưới">${H.symbol('grid')}</a><a href="${H.url('discover', { ...params, view: 'list' })}" class="${list ? 'is-active' : ''}" ${list ? 'aria-current="true"' : ''} aria-label="Hiển thị dạng danh sách">${H.symbol('list')}</a></nav></div>
      ${s.filtered.length ? `<div class="${list ? 'b-results-list' : 'b-card-grid b-results-grid'}">${s.filtered.map(r => list ? H.row(r) : H.card(r, { compact: true })).join('')}</div>` : H.empty(s)}
      <p class="b-data-note">${H.data.length} mục fixture · Bộ lọc hoạt động trên dữ liệu mẫu; điểm số không phải đánh giá người dùng thật.</p>
      </div>
    </div></main>${H.footer()}`;
  }

  function detail(H, r, s) {
    return `${H.header('directory')}<main id="main" tabindex="-1" class="b-main"><div class="b-detail-wrap"><nav class="b-breadcrumb" aria-label="Đường dẫn"><a href="${H.url('discover')}">Thư viện</a><span aria-hidden="true">/</span><a href="${H.url('discover', { category: r.category })}">${H.escape(r.category)}</a><span aria-hidden="true">/</span><span>${H.escape(r.name)}</span></nav>
      <div class="b-detail-grid"><aside class="b-identity-panel"><div class="b-product-identity">${H.icon(r, 'lg')}<p class="b-kicker">${H.escape(r.category)}</p><h1>${H.escape(r.name)}</h1><p class="b-product-purpose">${H.escape(r.summary)}</p></div><a class="b-primary-link" href="${H.escape(r.homepage)}" target="_blank" rel="noopener noreferrer">Đến nguồn chính thức ${H.symbol('external')}</a><button type="button" class="b-save-button" data-save="${H.escape(r.id)}">${H.symbol('bookmark')}Lưu trong phiên</button><p class="b-source-note">Mở website bên ngoài. Kiểm tra phiên bản và điều khoản tại nguồn.</p><div class="b-facts-box">${H.facts(r)}</div>${r.repo ? `<a class="b-repo-link" href="${H.escape(r.repo)}" target="_blank" rel="noopener noreferrer">${H.symbol('code')}Xem mã nguồn ${H.symbol('external')}</a>` : ''}</aside>
      <div class="b-detail-body"><div class="b-detail-preview">${H.preview(r)}</div><div class="b-reading-note">${H.symbol('book')}<p>Hiểu công cụ trước khi chọn.<span>Thông tin bên dưới là nội dung fixture, chưa phải bài đánh giá đã kiểm chứng.</span></p></div><div class="b-detail-article">${H.article(r)}</div></div></div>
      <section class="b-related">${H.related(r)}</section>
    </div></main>${H.footer()}`;
  }

  return { home, discover, detail };
})();
