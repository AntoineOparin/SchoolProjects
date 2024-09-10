import java.util.Random;

public class DCA {
    private Card[] stack;
    private Random rng;
    private int pointer;

    public DCA() {
        this.stack = new Card[100];
        this.pointer = 0;
		this.rng = new java.util.Random();
	}

	public int getPointer() {
		return pointer;
	}

	public int getLength() {
		return pointer - 1;
	}

	public Card getStackAtIndex(int i) {
		if (i < 0 || i > getPointer()) throw new IndexOutOfBoundsException("Hey Loser, that's not an option, try again.\n");
		return stack[i];
	}

	public Card[] getStack() {
		return stack;
	}

	public void setNewStack(Card[] newStack) {
		this.stack = newStack;
	}

	public void clear() { 
		this.stack = new Card[100];
        this.pointer = 0;
	}

    public void shuffle() {
		for (int i = 0; i < this.pointer; i++) {
			int randomIndex = rng.nextInt(this.pointer);
			Card bubbleCard = this.stack[randomIndex];
			this.stack[randomIndex] = this.stack[i];
			this.stack[i] = bubbleCard;
		}	
	}

    public String toString(){
		String output = "";
		for (int i = 0; i < this.pointer; i++){
				output += "Position " + i + " : " + this.stack[i] + "\n";
		}
		return output;
	}

	public void addCard(Card card){
		this.stack[this.pointer] = card;
		this.pointer++;
	}

	public void removeAtIndex(int n) {
		this.stack[n] = null;
		for (int i = n; i < this.pointer; i++) {
			this.stack[i] = this.stack[i + 1];
		}
		pointer--;
	}
}
