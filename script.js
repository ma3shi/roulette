'use strict';

// ルール
class Rule {
  constructor() {
    this.ruleContent = document.getElementById('rule'); //ルール内容
    const ruleBtn = document.getElementById('show-rule'); //ルールボタン
    this.overlayBlur = document.getElementById('overlay-blur'); //ぼかし
    const closeRuleBtn = document.getElementById('close-rule'); //ルールを閉じるボタン
    // アローでthisをparentへ
    ruleBtn.addEventListener('click', () => this.openRule()); //ルールを開く
    closeRuleBtn.addEventListener('click', () => this.closeRule()); //ルールを閉じる
    this.overlayBlur.addEventListener('click', () => this.closeoverlayBlur()); //ぼかしを消す
  }

  //ルールを開く
  openRule() {
    this.ruleContent.classList.add('show');
    this.overlayBlur.classList.remove('hidden');
  }

  //ルールを閉じる
  closeRule() {
    this.ruleContent.classList.remove('show');
    this.overlayBlur.classList.add('hidden');
  }

  //ぼかしを消す
  closeoverlayBlur() {
    this.ruleContent.classList.remove('show');
    this.overlayBlur.classList.add('hidden');
  }
}

//ルーレット
class Roulette {
  constructor() {
    this.canvas = document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.x = this.canvas.width / 2; //canvas,円の中心(x軸)
    this.y = this.canvas.height / 2; //canvas,円の中心(y軸)
    this.radius = 130; //半径
    this.pieceAngle = 30; //円の一片の角度
    this.startPiecePosition; //一片の始まりの位置
    this.roulettePosition = 0; //ルーレットの位置
    this.timeoutId;

    //扇型の中身
    this.contents = [
      { color: 'pink' },
      { color: 'lightyellow' },
      { color: 'gray' },
      { color: 'lightyellow' },
      { color: 'gray' },
      { color: 'lightyellow' },
      { color: 'gray' },
      { color: 'lightyellow' },
      { color: 'gray' },
      { color: 'lightyellow' },
      { color: 'gray' },
      { color: 'lightyellow' },
    ];
  }
  /**
   * 一片を描写
   * @param {number} cx x座標値
   * @param {number} cy y座標値
   * @param {number} radius 半径
   * @param {number} startAngle 一片の始まりの角度
   * @param {number} endAngle 一片の終わりの角度
   * @param {string} color 色
   */
  drawPiece(cx, cy, radius, startAngle, endAngle, color) {
    const startAngleRadian = (startAngle * Math.PI * 2) / 360; //度からラジアンに変換
    const endAngleRadian = (endAngle * Math.PI * 2) / 360; //度からラジアンに変換

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy); //起点へ移動
    this.ctx.fillStyle = color; //塗りつぶしの色
    //参考:https://developer.mozilla.org/ja/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes#arcs
    //false:時計回り
    this.ctx.arc(cx, cy, radius, startAngleRadian, endAngleRadian, false);
    this.ctx.fill();
  }

  /**
   * ルーレット(円)を描画
   * @param {number} position 一片の始まりの角度
   */
  drawRoulette(position) {
    this.startPiecePosition = position; //一片の始まりの角度
    this.contents.forEach(content => {
      //startPiecePosition+pieceAngle(一片の終わりの角度)
      // prettier-ignore
      this.drawPiece(this.x,this.y,this.radius,this.startPiecePosition,
      this.startPiecePosition + this.pieceAngle,content.color
    );
      this.startPiecePosition += this.pieceAngle; //扇型１つ分の角度を加えて次の一片の始まりの位置へ
    });
  }

  //矢印表示
  drawArrow() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y - this.radius); //中心に移動して半径分上へ、三角形の上
    this.ctx.lineTo(this.x + 10, this.y - this.radius + 15); //三角形の右下
    this.ctx.lineTo(this.x - 10, this.y - this.radius + 15); //三角形の左下
    this.ctx.closePath();
    this.ctx.fillStyle = 'red'; //色
    this.ctx.fill();
  }

  //ルーレットを回す
  runRoulette() {
    this.anglePlus = 10; //加算する角度
    this.roulettePosition += this.anglePlus; //角度を加算
    // console.log(this.roulettePosition);
    this.drawRoulette(this.roulettePosition); //ルーレット(円)を描画
    this.timeoutId = setTimeout(() => {
      this.runRoulette();
    }, 10); //スピード調整
    this.drawArrow(); //矢印表示
  }

  //画面クリア
  clearDisplay() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  //ルーレット初期化
  initRoulette() {
    this.roulettePosition = 0; //ルーレットの位置
    this.clearDisplay(); //画面クリア
    this.drawRoulette(0); //ルーレット(円)を描画
    this.drawArrow(); //矢印表示
  }
}

//　ゲーム
class Game {
  constructor() {
    const rule = new Rule(); //ルール
    this.roulette = new Roulette(); //ルーレット
    this.startBtn = document.getElementById('start'); //スタートボタン
    this.stopBtn = document.getElementById('stop'); //ストップボタン
    this.retryBtn = document.getElementById('retry'); //リトライボタン
    this.remainCountEl = document.getElementById('remain-count'); // 残り回数
    this.rouletteResult = document.getElementById('roulette-result'); //ルーレット結果

    this.drumSound = document.querySelector('.drum'); //ドラム音
    this.fanfareSound = document.querySelector('.fanfare'); //ファンファーレ音
    this.missSound = document.querySelector('.miss'); //ミス音

    this.retryGame();

    //スタートボタンを押す アロー関数でthisをparentへ
    this.startBtn.addEventListener('click', () => {
      if (this.startBtn.classList.contains('inactive')) return; //スタートボタン利用不可
      this.startBtn.classList.add('inactive'); //スタートボタン
      this.stopBtn.classList.remove('inactive'); //ストップボタン
      this.startRoulette(); // ルーレットスタート
    });

    //ストップボタンを押す
    this.stopBtn.addEventListener('click', () => {
      if (this.stopBtn.classList.contains('inactive')) return; //ストップボタン利用不可
      this.stopBtn.classList.add('inactive'); //ストップボタン
      this.startBtn.classList.remove('inactive'); //スタートボタン
      this.stopRoulette(); //ルーレットストップ
    });

    //リトライボタンを押す
    this.retryBtn.addEventListener('click', () => {
      if (this.retryBtn.classList.contains('inactive')) return; //リトライボタン利用不可
      this.retryBtn.classList.add('inactive'); //リトライボタン
      this.startBtn.classList.remove('inactive'); //スタートボタン
      this.retryGame(); //ゲームリトライ
    });
  }
  // ルーレットスタート
  startRoulette() {
    this.roulette.initRoulette(); //ルーレット初期化
    this.roulette.runRoulette(); //ルーレットを回す
    this.rouletteResult.textContent = '';
    this.count--; // 残り回数
    this.remainCountEl.textContent = `あと${this.count}回`; // 残り回数表示
    this.drumSound.play(); //ドラム音スタート
  }

  //ルーレットストップ
  stopRoulette() {
    clearTimeout(this.roulette.timeoutId);
    this.checkHit(); //当たりチェック
    this.drumSound.pause(); //ドラム音ストップ
  }

  //ゲームリトライ
  retryGame() {
    this.roulette.initRoulette(); //ルーレット初期化
    this.count = 3; // 残り回数
    this.remainCountEl.textContent = `あと${this.count}回`; // 残り回数表示
    this.rouletteResult.textContent = '';
  }

  //当たりチェック
  checkHit() {
    const hitAngle = 270; //当たりの位置
    const currntPosition = this.roulette.roulettePosition % 360; //360度単位へ
    console.log(currntPosition);

    //currntPositionがピンクの一片の始点なのでhitAngleから一片の角度を引いた位置から当たり範囲に入る
    if (
      hitAngle - this.roulette.pieceAngle <= currntPosition &&
      currntPosition <= hitAngle
    ) {
      console.log('win!');
      // this.roulette.ctx.font = 'bold 24px sans-serif'; //フォント
      // this.roulette.ctx.fillText('当たり!', 30, 30);
      console.log(this.rouletteResult.textContent);
      this.rouletteResult.textContent = '当たり!!';
      this.startBtn.classList.add('inactive'); //スタートボタン
      this.retryBtn.classList.remove('inactive'); //リトライボタン
      this.fanfareSound.play(); //ファンファーレ音
    } else {
      console.log('lose');
      // this.roulette.ctx.font = 'bold 24px sans-serif'; //フォント
      this.missSound.play(); //ミス音
      // 残り回数0
      if (this.count === 0) {
        console.log(this.rouletteResult.textContent);
        this.rouletteResult.textContent = 'Game over';
        // this.roulette.ctx.fillText('Game over', 30, 30);
        this.startBtn.classList.add('inactive'); //スタートボタン
        this.retryBtn.classList.remove('inactive'); //リトライボタン
        // 残り回数0以外
      } else {
        console.log(this.rouletteResult.textContent);
        this.rouletteResult.textContent = 'もう一度';
        // this.roulette.ctx.fillText('もう一度', 30, 30);
      }
    }
  }
}

new Game();
