const cardsListener = document.querySelector('#cards')

const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}


const symbles = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

// 以下為 MVC 架構

const views = {
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  getCardElement(index) {
    return `<div class="card back" data-index="${index}">
    </div>`
  },

  getCardElementContent(index) {
    const number = this.transformNumber((index) % 13 + 1)
    const symble = symbles[Math.floor((index) / 13)]
    return `
      <p>${number}</p>
      <img src="${symble}">
      <p>${number}</p>
    `
  },

  displayCard(indexes) {
    const cardElement = document.querySelector('#cards')
    cardElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        // console.log(card.dataset.index)
        card.innerHTML = this.getCardElementContent(Number(card.dataset.index))
        card.classList.remove('back')
        return
      }
      card.classList.add('back')
      card.innerHTML = ''
    })

  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('match')

    })

  },
  cardScoreNumber(score) {
    document.querySelector('.score').innerHTML = `score : ${score}`
  },
  cardTrytime(tried) {
    document.querySelector('.tried').innerHTML = `You've tried : ${tried} times`
  },
  cardClickAnimation(...cards) {
    cards.map(card => {
      card.classList.add('anima')
      card.addEventListener('animationend', event => event.target.classList.remove('anima'), { once: true })
    })
  },
   
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
  }




const utility = {
  getRandomNumberArray(count) {
    const array = Array.from(Array(count).keys())
    for (let index = array.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [array[index], array[randomIndex]] = [array[randomIndex], array[index]]
    }
    return array
  }
}



const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  tryTime: 0,
}



const controller = {
  currentState: GAME_STATE.FirstCardAwaits,  // 加在第一行
  // ... 
  generateCards() {
    views.displayCard(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        views.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        views.cardTrytime(++model.tryTime)
        // 如果++ 放在後面的話 猜牌時第一次 部會顯示次數 第二次才會 所以要放前面
        views.flipCards(card)
        model.revealedCards.push(card)
        if (model.isRevealedCardsMatched()) {
          model.score += 10
          views.cardScoreNumber(model.score)
          this.currentState = GAME_STATE.CardsMatched
          // 要記得 要加前面的views
          views.pairCards(...model.revealedCards)
          // views.pairCards(model.revealedCards[1])
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            views.showGameFinished()  // 加在這裡
            return
          }else{
           this.currentState = GAME_STATE.FirstCardAwaits 
          }
          
          // 配對正確
        } else {
          views.cardClickAnimation(...model.revealedCards)
          this.currentState = GAME_STATE.FirstCardAwaits
          setTimeout(
            this.resetCards
            // views.flipCards(...model.revealedCards)
            // // views.flipCards(model.revealedCards[1])
            // model.revealedCards = []

            // // 沒清空 model.revealedCards 這個陣列 會導致最一開始的牌組 一直重複開關 所以一訂要加上 model.revealedCards = []
            
            // this.currentState = GAME_STATE.FirstCardAwaits
            , 1000)
        }

    }
    // console.log(card)
    // console.log(this.currentState)
    // console.log(model.revealedCards)
  },

  resetCards() {
    views.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
    // 以上 controller 不能用 this 因為會指向 setTimeout
  }
}

controller.generateCards()




// 以下為事件_____________________________________________________________________



document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    console.log(card)

    controller.dispatchCardAction(card)
    // 不允許用 event.target 因為如果是正面時 如果點到 花色 或數字時 會整個消失 
  })
})

// 事件委託 event+target 不過有個壞處 就是每點一個元素他都會觸發該元素的位置 所以會導致意料之外的壯況 像如果我用
//  以上當作範例 views.flipCard(card) 換成 views.flipCard(event.target) 就會導致 點到 花色 或數字時 會整個消失 

