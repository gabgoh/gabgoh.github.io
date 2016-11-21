# Decoding The Thought Vector 

The building blocks of deep neural networks are large, dense matrices, with intermediate representations which have thus far defied interpretation. Despite its complexity, there is a growing body of evidence that most of it is overparamatized, with its vast majority occupied by "dead space". In this blog post I conjecture that beneath the network's dense representations lies a sparse, light substructure which can be teased out using a simple numerical technique, (the $k$-SVD). 

Applying this trick to a Variational Autoencoder, trained on a dataset of faces, produces decompositions like this

<div id = "breakdown1"></div>

and applying it to the image captioning system NeuralTalk2 yields a breakdown of a sentence into the sum of a few simple sentence fragments.

<div id = "wordbreakdown1"></div>

Unlike approaches like InfoGAN ([Chen et al.](https://arxiv.org/find/cs/1/au:+Chen_X/0/1/0/all/0/1)) or the $\beta$-VAE ([Higgins et al.](http://openreview.net/pdf?id=Sy2fzU9gl)) this requires no special training. And this idea can be in principle applied to a large class of neural networks. 

### The Encoder/Decoder Network Design

Lets restrict our attention to a common pattern in neural network design. A little old school, perhaps, but still elegant, this pattern combines two powerhouses of deep learning, an encoder and a decoder, via composition to produce our net,
$$
x\mapsto  {\bf Decoder}({\bf Encoder}(x)).
$$
The Encoder is the lens in which we see the data. It sees the raw data, and through a sequence of linear transformations and activations, distills all of its salient information into an incomprehensible array of numbers (one typically smaller than the input size). The decoder takes this vector, and through another poorly understood process, interprets it, returning the desired output. This formula is simple, but effective. A good number of papers in deep learning are a result of finding such fruitful combinations.<table class = "tables"><thead><tr><th style="width:25%"><img src="c2c.svg" alt="c2c"></th><th style="width:25%"><img src="c2r.svg" alt="c2r"></th><th style="width:25%"><img src="r2c.svg" alt="r2c"></th><th style="width:25%"><img src="r2r.svg" alt="r2r"></th></tr></thead><tbody><tr style="font-size:14px"><td><b>Autoencoder</b><br><a href="https://arxiv.org/abs/1602.03220">Lamb et al.</a><br><a href="https://arxiv.org/abs/1312.6114">Kingma et al.</a></td><td><b>Image Captioning</b> <a href = "https://arxiv.org/abs/1609.06647">Vinyals et al.</a>  <a href = "https://github.com/karpathy/neuraltalk2">NeuralTalk2</a></td><td><b>Image Synthesis</b><br><a href="https://arxiv.org/abs/1605.05396">Reed et al.</a></td><td><b>Seq2Seq</b><br><a href="https://arxiv.org/abs/1409.3215">Sutskever et al.</a><br><a href="https://arxiv.org/abs/1506.05869">Vinyals et al.</a></td></tr></tbody></table>

The defining characteristic of these architectures is the information bottleneck. This bottleneck is the output of ${\bf Encoder}$ and the input of ${\bf Decoder}$ and is illustrated by the solid black rectangle in the above diagrams. At least in principle, the information bottleneck forces a compression of the input data by mapping it into a lower dimension, so that only its meaningful dimensions of variation are captured - and the rest, 'noise', is discarded. 

This vector has been called, by various people, an "embedding", a "representational vector" or a "latent vector". But Geoff Hinton, in a stroke of marketing genius, gave it the name "thought vector".

#### The Geometry of Thought Vectors

Thought vectors have been observed empirically to possess some curious properties. The most fascinating among these is known colloquially as "Linear Structure" - the observation that certain directions in thought-space can be given semantic meaning.

[White](https://arxiv.org/abs/1609.04468) observes the following property, for example. Take an autoencoder trained on faces. First we identify (by hand) a few (say $S$) images containing a certain qualitative feature - a smile, for example. Encode and average them to get a vector, $d_{\small smile}$. 

![equation_smile](equation_smile.svg)

This output, which [White](https://arxiv.org/abs/1609.04468) calls the smile vector, can be interpreted as a code for an abstract smile. We can visualize this vector by looking at its output on the decoder. 

![decoder_smile](decoder_smile.svg)

The background of this image is grey - a clue about its indifference to background color. And though the face is vaguely feminine, it is also generic, apart from an exaggerated, toothy grin. We can add to any thought vector makes the decoder's output smile. 

![equation_fake_smile](equation_fake_smile.svg)

#### Ideas in Sparse Superposition

There is a very straightforward line of thought which follows from the observation of linear structure. Taking the dogma that directions are meanings to its logical conclusion, it's a small leap to conjecture the whole thought vector is nothing more than sum of these directions. Lets refer to these directions as atoms. If $x_i$ were a picture of a man in short hair wearing sunglasses, for example, a decomposition might look like
$$
\begin{align*}
{\bf Encoder}(x) \approx (2\cdot d_{\rm smile})
  - (1.5\cdot d_{\rm long-hair})  
   + (4\cdot d_{\rm sunglass}  )
   + (1\cdot d_{\rm masculinity}) 
\end{align*}
$$
If we had access to the full complement of $m$ atoms (now numbered) in $D=[d_1,\dots,d_m]$, we can write
$$
{\bf Encoder}(x)\approx {D}y\qquad  \mbox{for some  $D\in{\bf R}^{n\times m}$, $y \in {\bf R}^m$}\qquad \|y\|_0\leq k,\;\|d_i\|=1
$$
where $k$ is small. In this interpretation of a thought vector, the $d_i$'s themselves have no meaning - they just need to, collectively, satisfy a few simple mathematical properties. In essence, they just need to be "different enough". Different enough that its presence in the sum can be reliably determined.

The fact that detecting these atoms is even possible may seem counterintuitive. Adding numbers together is typically a destructive operation. Say if we add $2+1+3=6$, there's no way to recover $2,1,3$ from $6$ ($4,1,1$ works just as well). The story is different, however, in higher dimensions. If the $d_j$'s were orthogonal, we can check for $d_j$'s presence by probing the encoding on the left by taking the dot product with $d_j$. 
$$
d^{\hspace{0.5pt}T}_j{\bf Encoder}(x)\approx d^{\hspace{0.5pt}T}_j\!Dy\approx [y]_j
$$
This allows for the storage of $n$ atoms in a vector of size $n$. This is rather obvious, but bear with me. We can in fact store far more atoms than $n$ if $y$ is mostly nonzero. By the magic of [sparse recovery](http://www.math.ucla.edu/~wotaoyin/summer2013/slides/Lec03_SparseRecoveryGuarantees.pdf), we can store as many as $\mathcal{O}(ne^{n/k})$  atoms in a humble vector of length $n$ nondestructively. $D$ needs to satisfy a few technical properties, of course, but what is critical is that $k$ (the number of nonzero in $y$) is small. The sparser $y$ is, the more atoms we can handle. Think of this as a trade of between storing information in $y$ and storing information in the nonzero locations of $y$.

This is more than an information theoretic trick, however - its also a natural way of representing information. Think of this as [tagging](http://www.imdb.com/search/keyword/) system, where the nonzero in $y$ represents a tag. Every data point can be tagged with at most $k$ tags from a list of $m$ tags (e.g sunglasses, facial hair, blonde, etc), which can be large. Each tag has its own rating, but it is the tags themselves, not the individual ratings, which contain the salient information. This is basis of sparse coding.

Sparse structure has already been found in some shallow embedding system such as [word2vec](https://papers.nips.cc/paper/5021-distributed-representations-of-words-and-phrases-and-their-compositionality.pdf) by  [Arora et. al](https://arxiv.org/abs/1601.03764). And if such sparse structure exists in deep networks, we can derive a simple 2 step process to interpret thought vectors.

1. Take the data the model was trained on $\{x_1,\dots,x_N\}$


2. Try to recover $D$ and $y_i$ via Dictionary Learning

$$
\underset{D,y_i}{\mbox{minimize}}\quad \frac{1}{2}\sum _{i=1}^N\|Dy_i - {\bf Encoder}(x_i)\|^2\qquad  \mbox{s.t.} \qquad \|y_i\|_0\leq k,\quad  \|d_i\|=1.
$$
The second step in this process can be achieved heuristically with the $k$-SVD. For these experiments, I used [pyksvd](https://github.com/hoytak/pyksvd).

### Faces

My first experiment will be on a variational autoencoder designed by [Lamb et al.](https://github.com/vdumoulin/discgen), trained on the [Celeb-A](http://mmlab.ie.cuhk.edu.hk/projects/CelebA.html) dataset of faces. The thought vector is a $500$ element vector, and the encoder does a noble job of capturing most of the dimensions of variation in the images. 

Using a dictionary of $m=2000$ total atoms, with each element a sum of $k=15$ sparse atoms, I can produce a pretty respectable reconstruction of most of the faces. The atoms look like this, when visualized. The reconstructions can be visualized incrementally, by finding the best reconstruction for increasing values of $k$. 

<div id = "ascent_1"></div>

Notice how the reconstructor works much like an artist does. First painting generic faces in broad strokes, and then filling in small, local details which make the picture unique and recognizable. The picture, quite mesmordzingly, takes form in front of your eyes. Of course, we are not restricted to faces in the training set. We can use any picture, really. So in tribute to the great minds of deep learning,

<div id = "ascent_2"></div>

<div id = "ascent_3"></div>

On some of the more generic faces, the reconstruction is pretty decent even at  $k<8$. This allows us to visualize each atom's exact contribution to the overall picture. 

<div id = "breakdown2"></div>

<div id = "breakdown3"></div>

<div id = "breakdown4"></div>

True to our hypothesis, each vector in the dictionary has meaning. Like the smile vector, adding these vectors to existing images produces interesting effects. The usual suspects are all present, corresponding to 

Camera angle

<div id = "morph_angle"></div>

Facial Hair and Accessories

<div id = "morph_acc"></div>

Lighting

<div id = "morph_light"></div>

and Facial Expressions.

<div id = "morph_expression"></div>

But there are also a few interesting surprises. Like the following atoms for 

Face Shape

<div id = "morph_shape"></div>

or a whole slew of atoms dedicated to modeling the Forehead and Hair.

<div id = "morph_hair"></div>

And we can run this entire thing in reverse. This provides a way of querying our training set, to find, for example, all faces which are lit strongly from the front

<div id = "gallery_light"></div>

people wearing sunglasses

<div id = "gallery_sunglass"></div>

and fans of heavy metal music.

<div id = "gallery_gothic"></div>

### NeuralTalk2

We move on from interpolating images to interpolating sentences. Here we investigate the image captioning system [NeuralTalk2](https://github.com/karpathy/neuraltalk2). This network is a hybrid of a convolutional net (the VGGNet) and a recurrent net, fine tuned to the captioning task on the COCO dataset. This network as thought vector of size $768$. The network takes a picture, turns it into a thought vector, and turns that vector into a sentence using a recurrent neural net. The captions look like this:

|                   (1)                    |                   (2)                    |                   (3)                    |                   (4)                    |
| :--------------------------------------: | :--------------------------------------: | :--------------------------------------: | :--------------------------------------: |
| <img src = "/Users/gabe/Documents/caption/photos/cat.jpg"  style="width: 150px"> | <img src = "/Users/gabe/Documents/caption/photos/blackandwhite.jpg" style="width:150px"> | <img src = "/Users/gabe/Documents/caption/photos/skateboarders.jpg" style="width:150px"> | <img src = "/Users/gabe/Documents/caption/photos/knifedude.jpg"  style="width:150px"> |
|  a woman is holding a cat in a kitchen   | a couple of people walking down a street holding umbrellas | a group of four different types of computer equipment | a man in a suit and tie standing in a room |

which range in quality from the technically correct to pretty good. A conspicuous mistake the system often makes is the omission of certain critical, but somewhat out of place elements of a picture. 

The captioning system does marvelously on (1) and (2), picking up on subtle cues that the woman is holding a dog, and is in a kitchen. But where is the knife in (3), and the lego figurines in (4)? Our method of analysis provides a means to debug such problems. Surprisingly, using only a sparsity of $k=4$ and a dictionary size of $m=2000$ was enough.

Let us visualize these thought vectors. Our language model does not generate a single sentence, but a probability distribution over possible sentences. So we visualize its output in the form of a [dialog tree](https://i.imgur.com/eJxdKNe.jpg). Each path from the root to a leaf represents a sentence, with its probability the product of the thicknesses of the respective edges. I generated these figures by sampling from this distribution a few times, and combining the data in a trie.

Caption (1) produces the following output. 

<div id = "wordbreakdown_cat"></div>

Though the atomic sentences themselves have no names, I've taken the liberty of giving them my own labels to facilitate navigation. The output of the algorithm is a excellent synthesis of the concepts of "dog", "woman at counter", "woman in front cake", and surprisingly, the verb/noun combo "holding a cat".  We can visualize each atom by looking at examples of images for which thought vector contains these elements.

**Holding**

<div id = "gallery_holding"></div>

**Dog**

<div id = "gallery_dog"></div>

**Cake** 

<div id = "gallery_cake"></div>

**Woman** 

<div id = "gallery_woman"></div>

<img src = "/Users/gabe/Documents/caption/photos/knifedude.jpg" style="width: 150px">

Caption (2) consists of two meaningful atoms (I have omitted the two smallest atoms which were meaningless). The first corresponds to "a black and white picture", and the other to "man with an umbrella". 

<div id = "wordbreakdown_bw"></div>

And true to form, we can look at all the other pictures which contain these atoms

**Black and White Photo**

<div id = "black_white_woman"></div>

**Umbrella** 

<div id = "umbrella_woman"></div>

<img src = "/Users/gabe/Documents/caption/photos/skateboarders.jpg" style="width:150px">

Moving on to the problem images, caption (3) produces the following output.

<div id = "wordbreakdown_legomen"></div>

The keyboard is detected, of course. But surprisingly, so are the presence of the lego figures as "skateboarders". Failing to combine these two elements, the language model simply chose to omit what wasn't convenient to articulate. 

**Keyboard**

<div id = "gallery_keyboard"></div>

**Skater**

<div id = "gallery_skate"></div>

<img src = "/Users/gabe/Documents/caption/photos/knifedude.jpg"  style="width:150px">

Caption (4) demonstrates the same problem. Both "Scissors" and "Tie" are detected, but not articulated.

<div id = "wordbreakdown_knife"></div>

**Scissors**

<div id = "gallery_scissors"></div>

**Tie**

<div id = "gallery_tie"></div>

This "failure to synthesize" is surprisingly common. Taking linear combinations of two unrelated sentences, for example, would often result in the outputs interpolating in a discontinuous manner. Usually one or the other would dominate the output depending on their relative weights. It is never clear either how two atoms can combine. Take this atom for statue, for example

<div id = "gallery_statue"></div>

<div id = "wordmorpherstatue"></div>

The language model turns "man riding a snowboard" into "a statue of a man riding a horse". But it refuses to construct statues of a cat, instead opting for "a cat is sitting next to a statue". This problem is both a "bug" and a feature. The language models resistance to combing two semantically alien ideas seems to be an emergence of a kind of  "common sense" - it knows what statues are statues of. Bears, people riding on horses, people sitting on benches. Statues of airplanes and cats are less common. This sensibility, however, comes at the expense of a more free-form creativity. 

Like with faces, there are a small set of atoms which blend well with most atoms. Take this one for "a group of".

<div id = "gallery_many"></div>

<div id = "wordmorphermany"></div>

and here a similar atom seems to be able to count up to 4.

<div id = "gallery_count"></div>

<div id = "wordmorphercount"></div>

Rather curiously, it turns "airplanes" into "knives". And finally, here's one for "wearing a hat".

### Conclusion

All this leads to the question of why this structure should even exist in the first place. How does this structure emerges from training? And how does the decoder work? I do not have a concrete answer here, and thus will freely speculate.

Identifying sparse elements in a thought vector may not be as difficult a task as it initially seems. Given the right conditions on $D$ it can be done quite efficiently by solving the convex sparse coding problem:
$$
\underset{y}{\mbox{minimize}}\quad \frac{1}{2}\|Dy - {\bf Encoder}(x)\|^2\qquad  \mbox{s.t.} \qquad \|y_i\|_1\leq k.
$$
This is pretty encouraging. It has been hypothesized by [Gregor et al.](http://yann.lecun.com/exdb/publis/pdf/gregor-icml-10.pdf) that the decoder might be implementing an unfolded sparse coding algorithm, at least for a single iteration. Perhaps this theory can be confirmed by correlating various constellations of activations to the atoms of our dictionary. And perhaps there's a possibility we can read $D$ right off the decoder. 

The former riddle is more difficult to answer. And it breaks down into a bevy of minor mysteries when probed. Is this structure specific to certain neural architectures (perhaps those which use $\mbox{ReLu}$ activations)? Or does it come from the data? Was this structure discovered automatically, or were the assumptions of sparsity hidden in the network structure? Does sparse structure exist in all levels of representation, or only encoder/decoder networks? Is sparse coding even the true model for the data, or is this just an approximation to how the data is really represented? But lacking any formal theory of deep learning, these questions are still open to investigation. I hope to have convinced you, at least, that this is an avenue worth investigating.

This is my [website](http://gabgoh.github.io)

Also follow me on twitter <a href="https://twitter.com/gabeeegoooh" class="twitter-follow-button" data-show-count="false">Follow @gabeeegoooh</a>

<script src="trees.js"></script><script src="d3.v3.min.js"></script>

<script src="selector.js"></script>

<script src="texttree.js"></script>

<script async src="http://platform.twitter.com/widgets.js" charset="utf-8"></script>