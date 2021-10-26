//--------------------------------------------------------------------------
//                                                                        
//    This file is part of GenePool Swimbots.                             
//    Copyright (c) 2021 by Jeffrey Ventrella - All Rights Reserved.      
//                                                                        
//    See the README file or go to swimbots.com for full license details.           
//    You may use, distribute, and modify this code only under the terms  
//    of the "Commons Clause" license (commonsclause.com).                
//                                                                        
//    This software is intended for education, game design, and research. 
//                                                                        
// -------------------------------------------------------------------------- 

"use strict";

//----------------------------
function getInfoText( page )
{
    let text = "";
    
    //--------------------------------
    if ( page === 1 )
    {
        text
        = "<big><b>1. This is Gene Pool</b></big>"
        + "<br>"          
        + "<br>"          
        
        /*
        + "(c) 2021, Jeffrey Ventrella<br>"
        + "<a href = 'http://www.ventrella.com/' target = '_blank' style = 'text-decoration:none'>www.ventrella.com</a>"
        + "<br>"          
        + "<br>"          
        */
        
        + "Witness the effects of Darwinian evolution as hundreds of simulated organisms compete for mates and food. Explore this virtual aquarium of proto-swimming robots ('swimbots'), and see how mate preference can affect the course of evolution." 
        + "<br>"          
        + "<br>"          
        
        + "Watch the emergence of a dominant race of swimmers in about 30 minutes. Keep it running for longer and swimming skills will improve, where swimming 'skill' is determined entirely by natural selection."
        + "<br>"          
        + "<br>"          
        + "Every time you start a new pool, the outcome will be different."   
    }
    
    //--------------------------------
    else if ( page === 2 )
    {
        text
        = "<big><b>2. How to use Gene Pool</b></big>"
        + "<br>"
        + "<br>"
        
        + "1  Go to the 'pool' menu and start up a random pool."
        + "<br>"
        + "<br>"
        
        + "2  Explore the variety of swimbots using the view controls."
        + "<br>"
        + "<br>"
        
        + "3  If you want, you can help the swimbots by moving them around along with food bits (but don't help too much!)"
        + "<br>"
        + "<br>"
        
        + "4  Let Mother Nature do Her thing. Then come back after a while and choose the 'graph' menu to see how many swimbots there are. By around 50,000 time steps, a dominant race may have evolved. Sometimes everyone dies. That's not a software bug - that's nature!"    
        + "<br>"
        + "<br>"
        
        + "5  To save a swimbot or the state of the whole pool, you have to create a user account. Then you will be able to save and load swimbots ('swimbot' menu), and pools ('pool' menu)."   
    }
    
    //--------------------------------
    else if ( page === 3 )
    {
        text
        = "<big><b>3. Background</b></big>"
        + "<br>"
        + "<br>"
        + "This simulation is derived from an artificial life game called Darwin Pond (www.darwinpond.com). It was created by Jeffrey Ventrella at around 1996 for Rocket Science Games. Brian Dodd implemented it in Windows and also helped create some features. He has since helped develop several other games for <a href = 'http://www.wiggleplanet.com/' target = '_blank' style = 'text-decoration:none'>Wiggle Planet</a>."
        + "<br>"
        + "<br>"
        + "More detail can be found in a paper called 'Attractiveness vs. Efficiency, (How Mate Preference Affects Locomotion in the Evolution of Artificial Swimming Organisms)', MIT Press (Artificial Life VI Proceedings)."
        + "<br>"
        + "<br> "                   
        + "More background on this simulation can be found at www.Ventrella.com, as well as other biologically-inspired computer animations."   
    }
    
    //--------------------------------
    else if ( page === 4 )
    {
        text
        = "<big><b>4. Attractiveness vs. Efficiency</b></big>" 
        + "<br>" 
        + "<br>" 
        + "How important is it to be beautiful? Even though the male peacock has to work to carry around that costly tail it comes in handy when it is time to attract mates thus it is important for reproduction." 
        + "<br>" 
        + "<br>"                   
        + "The swimbots in Gene Pool normally choose to mate with others that exhibit similar colors. But if you switch this to one of the other available preferences, you can cause evolution to go in some interesting directions." 
        + "<br>" 
        + "<br>"                   
        + "Such explorations help to demonstrate the subtle interactions between two evolutionary forces recognized by Darwin: natural selection, and sexual selection."   
    }
    //--------------------------------
    else if ( page === 5 )
    {
        text
        = "<big><b>5. Swimbots</b></big>"            
        + "<br>"
        + "<br>"                   
        + "In Gene Pool, a population of proto-swimming machines called 'swimbots' evolves improved morphology and motor control for locomotion in a virtual fluid. Swimbots have two goals in life:"
        + "<br>"
        + "<br>"                    
        + "1.  to eat" 
        + "<br>"
        + "2.  to mate" 
        + "<br>"
        + "<br>"                             
        + "(not necessarily in that order). Their entire lives are spent pursuing these two goals."
        + "<br>"
        + "<br>"                              
        + "By clicking on a swimbot, and then choosing the 'swimbot' menu, you can monitor its vital signs."   
    }
    
    //--------------------------------
    else if ( page === 6 )
    {
        text
        = "<big><b>6. Darwinian Fitness</b></big>"
        + "<br>"
        + "<br>"
        + "If a swimbot is able to swim to another swimbot with which it wants to mate, then it has an offspring. Swimbots who are better at swimming, and swimbots who are more 'attractive' (i.e., chosen often as potential mates) have more offspring."
        + "<br>"
        + "<br>"
        + "In Gene Pool, the definition of 'fitness' is how good a swimbot is at reproducing, which means either being good at swimming, or just being attractive to other swimbots."   
    }
    
    //--------------------------------
    else if ( page === 7 )
    {
        text
        = "<big><b>7. Energy</b></big>"             
        + "<br>"
        + "<br>"
        + "Ambient energy in the pool is continually converted into food bits, which periodically send off spores and spread throughout the pool. Food bits are then eaten by swimbots. When swimbots move, they burn energy, which is then absorbed back into the pool."
        + "<br>"
        + "<br>"
        + "When a swimbot's energy is low, it becomes hungry, and must find a food bit to eat. Swimbots who are more energy-efficient don't need to eat as much, and can spend more of their lives mating."
    }
    
    //--------------------------------
    else if ( page === 8 )
    {
        text
        = "<big><b>8. Bodies</b></big>"
        + "<br>"
        + "<br>"
        + "Swimbots are made of parts. Parts are rigidly connected from end-to-end, and rotate at their joints in pendulum fashion. Parts come in a large variety of colors, lengths, and widths. Many genes are involved in determining the ways these parts are put together, and the amplitudes and phases of their angular motions."
        + "<br>"
        + "<br>"               
        + "None of these parts are associated with any explicit functions, as in the case of a 'limb', 'torso', 'fin', 'pseudopod', etc. However, there is one part (the base part) which has a 'genital' at one end and a 'mouth' at the other end. The purposes of these should be obvious.";
    }
    
    //--------------------------------
    else if ( page === 9 )
    {
        text
        = "<big><b>9. Embryology</b></big>"
        + "<br>"
        + "<br>"
        + "When a swimbot is born, a number of genes jump into action and begin a process whereby the various aspects of the body and motor control are determined. This is done via a recursive algorithm. "
        + "<br>"
        + "<br>"
        + "As a body is being made, part-by-part, the widths, lengths, colors, angles, and other attributes, are created, giving rise to cumulative effects. Some genes determine whether there is limb-branching and the nature of that branching. Other genes determine how motor control attributes are set as parts grow."
    }
    
    //--------------------------------
    else if ( page === 10 )
    {
        text
        = "<big><b>10. Genetic Engineering</b></big>"
        + "<br>"
        + "<br>"
        + "The swimbot dialog has a button for tweaking the genes of the selected swimbot. Many of these genes have effects that are difficult to predict, and some of them inhibit other genes, causing them to have no effect when you tweak them. Not even the designer of the embryology scheme can explain all of the effects caused by the combination of these genes. That's the nature of Designing Emergence: the outcome is unpredictable." 
        + "<br>"
        + "<br>"
        + "It helps to know that there is a kind of 'embryogenesis' that has cumulative effects on attributes. Also, a swimbot can have as many as three 'categories' of parts, and you can tweak the associated genes by selecting one of the sets. "
    }
    
    //--------------------------------
    else if ( page === 11 )
    {
        text
        = "<big><b>11. How to Recognize Genitals and Mouths</b></big>"
        + "<br>"
        + "<br>"
        + "When a swimbot is interested in mating, you can see a white line sticking out of its body. That is its genital. If it has fallen in love, an arrow appears at the end of the line, and it aims in the direction of its chosen mate."
        + "<br>"
        + "<br>"
        + "When it is hungry, you can see a green line sticking out of another region on the body. This is its mouth. If the swimbot has found a food bit, it opens up to become two lines, and aims in the direction of its chosen food bit."
    }
    
    //--------------------------------
    else if ( page === 12 )
    {
        text
        = "<big><b>12. Brain and Sensors</b></big>"
        + "<br>"
        + "<br>"
        + "Swimbots have four mental states: "
        + "<br>"
        + "<br>"
        + "(1) Looking for a mate "
        + "<br>"
        + "(2) Pursuing a mate it has chosen "
        + "<br>"
        + "(3) Looking for a food bit "
        + "<br>"
        + "(4) Pursuing a food bit it has chosen "
        + "<br>"
        + "<br>"
        + "A swimbot relies on only two sensors: "
        + "<br>"
        + "<br>"
        + "(1) its own energy, which determines its hunger and whether it will pursue food or mates" 
        + "<br>"
        + "<br>"
        + "(2) the direction of a chosen mate or food bit - which affects its turning behaviors."
    }
    
    //--------------------------------
    else if ( page === 13 )
    {
        text
        = "<big><b>13. Motion</b></big>"
        + "<br>"
        + "<br>"
        + "Every part's characteristic motion is determined by the amplitudes and phases of the sine waves. And this is determined at birth in the embryological phase. The amplitudes and phases are modulated by the direction of a chosen food bit or mate, at any given time. From birth until death, the swimbot will always be rotating its parts. Only in starvation, old age, and the moments after mating will there be any slowing of this clock-work motion. "
        + "<br>"
        + "<br>"
        + "Since there are many parts, and a large number of gene combinations, there are consequently many possible motion styles: the motion phenotype space is very large indeed."
    }
    
    //--------------------------------
    else if ( page === 14 )
    {
        text
        = "<big><b>14. The Physics of Swimming</b></big>"
        + "<br>"
        + "<br>"
        + "A forward dynamics algorithm is used to generate linear and angular momentum in a swimbot's body. This is the result of parts moving within the fluid. "
        + "<br>"
        + "<br>"
        + "Broad strokes that are perpendicular to the axis of the stroking part have the largest effect (they exert the greatest force). "
        + "<br>"
        + "<br>"
        + "Forces from part motions can sometimes cancel each other out. Therefore, coordinated motions of parts is required for efficient swimming. "
    }
    
    //--------------------------------
    else if ( page === 15 )
    {
        text
        = "<big><b>15. Perception</b></big> "
        + "<br> "
        + "<br> "
        + "Swimbots can see a full 360 degrees, but within a limited view distance. Swimbots can detect the direction of a food bit or a potential mate relative to its own orientation. This perception is used to determine how the swimbot turns. "
        + "<br> "
        + "<br> "
        + "Swimbots also can detect certain qualities in other swimbots such as sizes and colors of parts, motions of parts, and the spatial distributions of parts relative to each other. This is so that they can choose mates based on certain sexual preferences, such as 'long', 'hyper', 'big', etc. "
    }
    
    //--------------------------------
    else if ( page === 16 )
    {
        text
        = "<big><b>16. Turning</b></big>"
        + "<br>"
        + "<br>"
        + "If a swimbot has chosen a mate or a food bit as its goal the direction of that goal relative to its own orientation determines how it turns its body. This is an angular value. "
        + "<br>"
        + "<br>"
        + "But the exact manner in which a swimbot turns is completely up to genetic evolution. The only thing a swimbot knows is the direction of the goal, which triggers modulators in each part to alter the amplitudes and phases of its sine wave rotations. The kinds of modulations in each part are genetically determined. And you may notice that in the early stages of evolution, many swimbots are not able to turn correctly, and sometimes even swim away from their goal!"
    }
    
    //--------------------------------
    else if ( page === 17 )
    {
        text
        = "<big><b>17. Mate Choice</b></big>"
        + "<br>"
        + "<br>"
        + "When a swimbot is looking for a mate, it takes a 'snapshot' of every swimbot within its view, and then ranks these snapshots according to its criterion for beauty. It then chooses the most attractive one and begins to pursue it."
        + "<br>"
        + "<br>"
        + "Unlike pursuing food bits, in which the closest food bit is always the first choice, pursuing a chosen mate is a permanent decision, even if a more attractive swimbot wiggles by as it's pursuing its choice. You might be tempted to call this 'monogamy' - however, after mating, a swimbot could just as easily choose another mate which it finds more attractive. "
    }
    
    //--------------------------------
    else if ( page === 18 )
    {
        text
        = "<big><b>18. Attraction</b></big>"
        + "<br>"
        + "<br>"
        + "In sizing up a potential mate, a swimbot will normally look for body part colors that most match its own body part colors. For instance, a swimbot with mostly purple parts will be more attracted to a red swimbot with some purple in its body than a red swimbot with some green in its body. And a mostly-yellow swimbot would be considered quite ugly. "
        + "<br>"
        + "<br>"
        + "Alternate attraction criteria can be set by you, for experimental purposes. The complete list of attraction criteria are as follows: "
        + "<br>"
        + "<br>"
        + "similar color,    &nbsp&nbsp" 
        + "big,              &nbsp&nbsp" 
        + "hyper,            &nbsp&nbsp" 
        + "long,             &nbsp&nbsp" 
        + "straight,         &nbsp&nbsp" 
        + "opposite color,   &nbsp&nbsp" 
        + "small,            &nbsp&nbsp" 
        + "still,            &nbsp&nbsp" 
        + "short,            &nbsp&nbsp" 
        + "crooked,          &nbsp&nbsp" 
        + "closest,          &nbsp&nbsp" 
        + "random"
    }
    
    //--------------------------------
    else if ( page === 19 )
    {
        text
        = "<big><b>19. Reproduction</b></big>"
        + "<br>"
        + "<br>"
        + "When swimbots mate, they produce exactly one offspring, which appears in-between the parents. The offspring appears as a small white egg, and immediately begins to grow. When fully grown, it changes from white to fully-colored. "
        + "<br>"
        + "<br>"
        + "Genetic crossover occurs when an offspring is born, giving it alternating genetic building blocks from both parents. Random mutation can occur in some genes during mating. "
    }
    
    //--------------------------------
    else if ( page === 20 )
    {
        text
        = "<big><b>20. The Microscope</b></big>"
        + "<br>"
        + "<br>"
        + "The microscope controls can be found below. It has buttons for shifting the view up, down, left, or right. You can also zoom the view in or out. You may also use the keyboard (arrow keys shift the view, 'plus' and 'minus' keys zoom). "
        + "<br>"
        + "<br>"
        + "The View button provides some options such as viewing the whole pool, autotracking groups of swimbots, and watching certain 'mini-dramas' among swimbots. These mini-dramas may not make sense at first, but after the swimbots have evolved some, they become more meaningful, and are sometimes sad, sometimes amusing. "
    }
    
    //--------------------------------
    else if ( page === 21 )
    {
        text
        = "<big><b>21. Breeding</b></big>"
        + "<br>"
        + "<br>"
        + "You can encourage some isolated gene pools of similar swimbots) to survive by moving swimbots and food around, and helping them to mate. However, you cannot determine with whom a swimbot will fall in love - you cannot force two swimbots to mate if they don't already have the hots for each other. "
        + "<br>"
        + "<br>"
        + "If you interfere with nature too much, you may not be successful in breeding a good population. Reward the swimbots who show potential. For instance, go to the view menu and find the most prolific swimbot. If it is an obviously good swimmer, clone it and encourage it to mate with its twin. This might help it to propogate its genes without getting diluted by unrelated swimbots."
    }
    
    //--------------------------------
    else if ( page === 22 )
    {
        text
        = "<big><b>22. Cloning and Killing</b></big>"
        + "<br>"
        + "<br>"
        + "To clone or kill a swimbot, select it and then choose the 'Swimbot' button. There you will see the two options, along with information about that swimbot." 
        + "<br>"
        + "<br>"
        + "<br>"
        + "Remember: if you clone a swimbot, you will halve its energy - the other half of the energy will go to its new identical twin. Repeated cloning makes the swimbots hungry, so make sure there is some food nearby." 
        + "<br>"
        + "<br>"
        + "<br>"
        + "For quick cloning and killing, select the swimbot and hit the 'C' or 'K' key. "
    }
    
    //--------------------------------
    else if ( page === 23 )
    {
        text
        = "<big><b>23. Saving and Loading Pool Files</b></big>"
        + "<br>"
        + "<br>"
        + "This part of the interface is not fully-implemented yet."
    }
    
    //--------------------------------
    else if ( page === 24 )
    {
        text
        = "<big><b>24. Loading Swimbots into an Empty Pool</b></big>"
        + "<br>"
        + "<br>"
        + "If you have previously saved a swimbot, you can load it back into an empty pool to start a population from scratch, based on your saved swimbot."
        + "<br>"
        + "<br>"
        + "To start up an Empty Pool, go to the 'Pool' menu, and then choose 'Empty'. Then, you can go to the 'Swimbot' menu and load up a swimbot you had previously saved. If you clone that swimbot, there will now be two. (And you know it takes two to Tango)."
    }
    
    //--------------------------------
    else if ( page === 25 )
    {
        text
        = "<big><b>25. Tweaking Energy Settings</b></big>"
        + "<br>"
        + "<br>"
        + "To change food and energy parameters, go to the 'Tweak'menu. There are five parameters you can change."
        + "<br>"
        + "<br>"
        + "1. Food Growth Delay - how slow food is re-generated. "
        + "<br>"
        + "<br>"
        + "2. Food Growth Spread - how far the food spreads. "
        + "<br>"
        + "<br>"
        + "3. Food Bit Energy - the amount of energy in a food bit. "
        + "<br>"
        + "<br>"
        + "4. Swimbot Hunger Threshold - the energy level below which a swimbot becomes hungry."
        + "<br>"
        + "<br>"
        + "5. Swimbot Energy Offspring Ratio - the percentage of energy a parent gives to its offspring. "
    }
    
    //--------------------------------
    else if ( page === 26 )
    {
        text
        = "<big><b>26. Keyboard Controls</b></big>"
        + "<br>"
        + "<br>"
        + "minus: - &nbsp&nbsp&nbsp (zoom microscope out)"
        + "<br>"
        + "plus: + &nbsp&nbsp&nbsp (zoom microscope in) "
        + "<br>"
        + "arrow keys: &nbsp&nbsp&nbsp (move microscope) "
        + "<br>"
        
        /*
        <!--
        P: &nbsp&nbsp&nbsp (open Pool dialog) 
        <br>
        T: &nbsp&nbsp&nbsp (open Tweak dialog) 
        <br>
        S: &nbsp&nbsp&nbsp (open Swimbot dialog) 
        <br>
        I: &nbsp&nbsp&nbsp (open Info dialog) 
        <br>
        -->
        K: &nbsp&nbsp&nbsp (kill selected swimbot) 
        <br>
        C: &nbsp&nbsp&nbsp (clone selected swimbot) 
        <br>
        <!--esc key: &nbsp&nbsp&nbsp (close dialogs - normal view) -->
        */
    }
    
    //--------------------------------
    else if ( page === 27 )
    {
        text
        = "<big><b>27. Who made this thing?</b></big>"
        + "<br>"
        + "<br>"
        + "Gene Pool was created by <a href = 'http://www.ventrella.com/' target = '_blank' style = 'text-decoration:none'>Jeffrey Ventrella</a>."
        + "<br>"
        + "<br>"
        + "The following people have contributed ideas and technical help in the evolution of Gene Pool:"
        + "<br>"
        + "<br>"
        + "In alphabetical order:       "
        + "<br>"
        + "<br>"
        + "Brian Dodd, Bryan Galdrikian, Will Harvey, Jeremy Hussell, Mike Kaplan, Art Medlar, Luka Negoita, Ken Pearce, Scott Schafer, Julia Smith, Qarl Stiefvater, Barry Stump, TechnoZeus, Philip Ventrella, Frey Waid, Gary Walker"


        /*
        + "Brian Dodd,<br>"
        + "Bryan Galdrikian,<br>"
        + "Will Harvey,<br>"
        + "Jeremy Hussell,<br>"
        + "Mike Kaplan,<br>"
        + "Art Medlar,<br>"
        + "Ken Pearce,<br>"
        + "Scott Schafer,<br>"
        + "Julia Smith,<br>"
        + "Qarl Stiefvater,<br>"
        + "Barry Stump,<br>"
        + "TechnoZeus,<br>"
        + "Philip Ventrella,<br>"
        + "Frey Waid,<br>"
        + "Gary Walker"
        */
    }
    
    //--------------------------------
    else if ( page === 28 )
    {
        text = "(c) copyright 2021 Jeffrey Ventrella";
    }            
    
    return text;
}

