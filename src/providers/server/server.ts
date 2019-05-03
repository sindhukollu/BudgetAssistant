// import { Injectable } from '@angular/core';
// import { Storage } from '@ionic/storage';
// import { filter, orderBy, some } from 'lodash';

// import { AngularFirestore } from 'angularfire2/firestore';
// // // local storage keys
// // import { LS_MYCARDS } from '../../app/constants/storageKeys';

// @Injectable()
// export class ServerProvider {
//   banksWithCards = [];
//   myCards = [];
//   constructor(
//     private storage: Storage,
//     private db: AngularFirestore) {
//   }

//   // getMyCards = (): any => {
//   //   return this.storage.get(LS_MYCARDS).then((value) => {
//   //     if(value && value.length){
//   //       this.myCards = value;
//   //       this.db.collection('banksWithCards').valueChanges().subscribe((data) => {
//   //         this.banksWithCards = data;
//   //         this.myCards.forEach((myCard, index) => {
//   //           var bankIndex = this.banksWithCards.findIndex(bank => bank.id == myCard.bankId);
//   //           var bankCards: Array<any> = this.banksWithCards[bankIndex].cards;
//   //           var cardIndex = bankCards.findIndex(card => card.cardId == myCard.cardId);
//   //           this.myCards[index] = bankCards[cardIndex];
//   //           this.storage.set(LS_MYCARDS, this.myCards);
//   //         })
//   //       });
        
//   //     } 
//   //     return this.myCards;
//   //   })
//   // }

//   // getSuggestedCards = (cards, tag) => {
//   //   this.myCards = cards;
//   //   this.myCards = filter(this.myCards, (card) => {
//   //     return some(card.cardBenifits, (benifits, benifitIndex) => {
//   //       return some(benifits.cashbackCategory, (category, index) => {
//   //           if(category.name == tag || benifits.description.includes(tag) || category.name == 'any'){
//   //             card.matchedBenifitIndex = benifitIndex;
//   //             return true;
//   //           }
//   //       })
//   //     })
//   //   });

//   //   this.myCards = orderBy(this.myCards, card => card.cardBenifits[card.matchedBenifitIndex].cashbackMultiplier, ['desc']);
//   //   return this.myCards;
//   // }

// }
