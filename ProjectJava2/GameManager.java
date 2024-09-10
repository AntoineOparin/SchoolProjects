import java.util.Random;

public class GameManager {
    Random rng;
    Player player1;
    Player player2;
    DCA deck;
    DCA allCards;
    DCA discardPile;

    public GameManager() {
        this.player1 = new Player("Player1");
        this.player2 = new Player("Player2");
        this.deck = new DCA();
        this.allCards = new DCA();
        this.discardPile = new DCA();
        this.rng = new java.util.Random();

        for(Card c : Card.values()) {
            for(int i = 0; i < c.getAmount(); i ++) {
                this.deck.addCard(c);
            }   
        }

        for(Card c : Card.values()) {
            this.allCards.addCard(c);
        }

        deck.shuffle();
        drawTopCard(player1.getHand());
        drawTopCard(player2.getHand());
    }

    public DCA resetDeck() {
        deck = new DCA();
        for(Card c : Card.values()) {
            for(int i = 0; i < c.getAmount(); i ++) {
                this.deck.addCard(c);
            }   
        }
        return deck;
    }

    public void drawTopCard(DCA player) {
        player.addCard(deck.getStackAtIndex(deck.getPointer() - 1));
        deck.removeAtIndex(deck.getPointer());
    }

    public boolean guessCard(DCA player, Card card) {
        return (card == player.getStackAtIndex(0));
    }

    public int compareHands(DCA player1, DCA player2) {
        return (player1.getStackAtIndex(0).getValue() > player2.getStackAtIndex(0).getValue()) ? 1 : 2;
    }

    public boolean isHandmaid(Card card) {
        return (card == Card.HANDMAID);
    }

    public void discardCard(DCA player, Card card) {
        for (int i = 0; i < player.getPointer(); i++) {
            if (card == player.getStackAtIndex(i))
                player.removeAtIndex(i);
        }
        discardPile.addCard(card);
    }

    public void princeDiscardCard(DCA player, DCA deck) {
        discardPile.addCard(player.getStackAtIndex(player.getPointer() - 1));
        player.removeAtIndex(player.getPointer());
        if (deck.getLength() > 1)
            drawTopCard(player);
    }

    public void tradeHands(DCA player1, DCA player2) {
        Card[] temp = player1.getStack();
        player1.setNewStack(player2.getStack());
        player2.setNewStack(temp);
    }

    public boolean checkCountess(DCA player){
        for(Card i : player.getStack()) {
            if (i == Card.PRINCE || i == Card.KING){
                discardCard(player, Card.COUNTESS);
                return true;
            }  
        }
        return false;
    }

    public boolean hasPrincess(DCA player) {
        for(Card i : player.getStack()) {
            if (i == Card.PRINCESS){
                return true;
            }
        }
        return false;
    }

}
