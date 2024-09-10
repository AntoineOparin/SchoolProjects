public class Player {
    private String name;
    private DCA hand;
    private int loveLetter;
    private boolean hasCountess;

    public Player(String name) {
        this.name = name;
        this.hand = new DCA();
        this.loveLetter = 0;
        this.hasCountess = false;
    }

    public String getName() {
        return this.name;
    }

    public DCA getHand() {
        return this.hand;
    }

    public int getLoveLetter() {
        return this.loveLetter;
    }

    public boolean getHasCountess() {
        return this.hasCountess;
    }

    public void giveNewHand() {
        this.hand = new DCA();
    }

    public boolean playerWin() {
        return (loveLetter == 5);
    }

    public void addLoveLetter() {
        loveLetter++;
    }

    public void hasCountess(Card card) {
        if (card == Card.COUNTESS)
            hasCountess = true;
    }
}
