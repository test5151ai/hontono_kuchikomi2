class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // フッターの前にクリア要素を挿入（フロート対策）
        if (!document.getElementById('footer-float-clear')) {
            const clearDiv = document.createElement('div');
            clearDiv.id = 'footer-float-clear';
            clearDiv.style.clear = 'both';
            clearDiv.style.display = 'block';
            clearDiv.style.width = '100%';
            clearDiv.style.height = '0';
            this.parentNode.insertBefore(clearDiv, this);
            
            console.log('フッタークリア要素を挿入しました');
        }
        
        this.render();
    }

    render() {
        const currentYear = new Date().getFullYear();
        
        this.innerHTML = `
            <style>
                .site-footer {
                    background-color: var(--primary-color);
                    color: var(--white);
                    padding: 3rem 0;
                    width: 100%;
                    position: relative;
                    z-index: 1;
                    display: block;
                    clear: both;
                }
                
                :host {
                    display: block;
                    width: 100%;
                    clear: both;
                    margin-top: auto;
                }
                
                .site-footer a {
                    color: var(--light-gray);
                    text-decoration: none;
                }
                
                .site-footer a:hover {
                    color: var(--accent-color);
                }
                
                .site-footer hr {
                    border-color: rgba(255,255,255,0.1);
                }
                
                .social-links {
                    display: flex;
                    align-items: center;
                }
                
                .social-links a {
                    transition: opacity 0.3s;
                }
                
                .social-links a:hover {
                    opacity: 0.8;
                }
            </style>
            <footer class="site-footer">
                <div class="container">
                    <div class="row">
                        <!-- サイト情報 -->
                        <div class="col-md-4 mb-4">
                            <h5>15ch.net について</h5>
                            <p>実際の利用者による信頼できる口コミのみを厳選して掲載する掲示板コミュニティです。全ての投稿は利用証明書類による厳格な審査を経て承認されます。</p>
                        </div>

                        <!-- リンク -->
                        <div class="col-md-4 mb-4">
                            <h5>リンク</h5>
                            <ul class="list-unstyled">
                                <li><a href="/about">このサイトについて</a></li>
                                <li><a href="/terms">利用規約</a></li>
                                <li><a href="/privacy">プライバシーポリシー</a></li>
                                <li><a href="/contact">お問い合わせ</a></li>
                            </ul>
                        </div>

                        <!-- ソーシャル -->
                        <div class="col-md-4 mb-4">
                            <h5>フォローする</h5>
                            <div class="social-links">
                                <a href="https://twitter.com/15ch_net" target="_blank" class="me-2">
                                    <img src="/assets/icons/twitter.svg" alt="Twitter" width="24" height="24">
                                </a>
                                <a href="https://github.com/test5151ai/hontono_kuchikomi2" target="_blank">
                                    <img src="/assets/icons/github.svg" alt="GitHub" width="24" height="24">
                                </a>
                            </div>
                        </div>
                    </div>

                    <hr class="mt-4 mb-4">

                    <!-- コピーライト -->
                    <div class="row">
                        <div class="col-md-12 text-center">
                            <p class="mb-0">&copy; ${currentYear} 15ch.net All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('site-footer', Footer); 