## 1. Perceptron Algorithm

Perceptron uses sign function:
$$
g(z)=
\begin{cases}
1 & z \ge 0 \\
0 & z < 0
\end{cases}
$$

Model:
$$
h_\theta(x)=g\left(\theta^\top x\right)
$$

Update rule (similar to logistic and linear regression, different hypothesis):
$$
\theta_j' = \theta_j + \alpha \sum_{i=1}^m \big(y^{(i)} - h_\theta(x^{(i)})\big)\,x_j^{(i)}
$$
$y^{(i)} - h_\theta(x^{(i)})$:  

- = 0 if predicted correctly
- = -1 if $y^{(i)}$ = 0 and wrong
- = 1 if $y^{(i)}$ = 1 and wrong

For a new misclassified example:
$$
\begin{aligned}
\theta_j'
&= \theta_j + \alpha\big(y^{(i)}-h_\theta(x^{(i)})\big)x_j^{(i)}\\
&= \theta_j \pm \alpha x_j^{i}
\end{aligned}

$$

## 2. Exponential Family

PDF (probability density function) general form of exponential family distribution:
$$
p(y;\eta)=b(y)\exp\big[\eta^\top T(y)-a(\eta)\big]
$$

Notation:

- $y$: data
- $\eta$: natural parameter
- $T(y)$: sufficient statistic, here $T(y)=y$
- $b(y)$: base measure
- $a(\eta)$: log‑partition function (normalizer)

### 2.1 Bernoulli (binary data)

Bernoulli PDF:
$$
p(y;\phi)=\phi^y(1-\phi)^{(1-y)}
$$

Rewrite to exponential family form:
$$
\begin{aligned}
p(y;\phi)
&=\exp\Big(\log\big(\phi^y(1-\phi)^{1-y}\big)\Big) \\
&=\exp\Big(y\log\frac{\phi}{1-\phi}+\log(1-\phi)\Big)
\end{aligned}
$$

Identify components:

- $b(y)=1$
- $T(y)=y$
- Natural parameter(scalar $\eta^\top = \eta$):

$$
\eta=\log\frac{\phi}{1-\phi} \quad\Rightarrow\quad \phi=\frac{1}{1+e^{-\eta}}
$$

- Log‑partition:

$$
a(\eta)=-\log(1-\phi)
$$

### 2.2 Gaussian (fixed variance $\sigma^2=1$)

Gaussian PDF:
$$
p(y;\mu)=\frac{1}{\sqrt{2\pi}}\exp\left(-\frac{(y-\mu)^2}{2}\right)
$$

Rewrite:
$$
p(y;\mu)=\frac{1}{\sqrt{2\pi}}e^{-\frac{y^2}{2}}\exp\left(\mu y-\frac12\mu^2\right)
$$

Components:

- $b(y)=\frac{1}{\sqrt{2\pi}}e^{-\frac{y^2}{2}}$
- $T(y)=y$
- $a(\eta)=\frac12\mu^2$
- $\eta=\mu$

> Bernoulli and Gaussian both belong to exponential family.

### 2.3 Properties for exponential family w.r.t natural parameter $\eta$

a) Maximum‑likelihood estimation objective is **concave** in $\eta$; negative log‑likelihood is convex.

b) Mean property:
$$
\mathbb{E}[y;\eta]=\frac{\partial}{\partial\eta}a(\eta)
$$

c) Variance property:
$$
\mathrm{Var}(y;\eta)=\frac{\partial^2}{\partial\eta^2}a(\eta)
$$

## 3. Generalized Linear Model (GLM)

### Assumptions / design choices

a) Given $x$, $y$ comes from an exponential‑family distribution: $y|x;\theta \sim \mathrm{ExponentialFamily}(\eta)$.

Common choices:

- Real‑valued data → Gaussian
- Binary data → Bernoulli
- Count (non‑negative integer) → Poisson
- Positive real $\mathbb R^+$ → Gamma / Exponential
- Other distributions: Beta, Dirichlet

b) Natural parameter is linear in input:
$$
\eta=\theta^\top x,\quad \theta\in\mathbb R^n,\;x\in\mathbb R^n
$$

c) Prediction output expected value:
$$
h_\theta(x)=\mathbb E\big[y\mid x;\theta\big]
$$

Learning objective: maximize log‑likelihood
$$
\max_\theta \sum_{i}\log p\big(y^{(i)};\theta^\top x^{(i)}\big)
$$

### 4. GLM Training

Batch gradient ascent update rule:
$$
\theta_j' := \theta_j + \alpha \sum_{i}\big(y^{(i)}-h_\theta(x^{(i)})\big)\,x_j^{(i)}
$$

Terminology:

- $\eta$: natural parameter
- Canonical response function: $\mu = g(\eta)=\frac{\partial}{\partial\eta}a(\eta) = \mathbb E[y;\eta]$
- Canonical link function: $\eta = g^{-1}(\mu)$

Three parametrization:
$$
\underbrace{\theta^\top x}_{\text{model param}}
\;\rightarrow\;
\underbrace{\eta}_{\text{natural param}}
\;\xrightarrow{g}\;
\underbrace{\phi/\mu/\lambda}_{\text{canonical param}}
$$

- Bernoulli: $\phi$
- Gaussian: $\mu$
- Poisson: $\lambda$

#### Example 1: Logistic Regression

$$
h_\theta(x)=\mathbb E[y|x;\theta]=\phi=\frac{1}{1+e^{-\theta^\top x}}
$$
Update:
$$
\theta_j' = \theta_j + \alpha \sum_i \big(y^{(i)}-h_\theta(x^{(i)})\big)\,x_j^{(i)}
$$

#### Example 2: Linear Regression

$y|x;\theta \sim \mathrm{Gaussian}$,
$$
\eta=\mu=\theta^\top x
$$

## 5. Softmax Regression

Multi‑class classification, minimize cross‑entropy.

- $K$: number of classes
- Input $x^{(i)}\in\mathbb R^n$
- Label $y$: one‑hot vector $\in\{0,1\}^K$, e.g. $[0,0,1]$
- Parameter matrix: $K$ weight vectors $\theta_\mathit{class}\in\mathbb R^n$

Softmax probability:
$$
p(y=k\mid x;\theta)=\frac{\exp(\theta_k^\top x)}{\sum_{l=1}^K\exp(\theta_l^\top x)}
$$

Cross‑entropy loss between true distribution $p$ and predicted $\hat p$:
$$
\mathrm{cross\_entropy}(p,\hat p)
=-\sum_{y\in\mathit{classes}} p(y)\log \hat p(y)
$$

For one‑hot label $y_0$ (only one entry is 1):
$$
\mathcal L = -\log\;\hat p(y_0)
= -\log\left(
\frac{e^{\theta_{y_0}^\top x}}
{\sum_{i\in\mathit{classes}} e^{\theta_i^\top x}}
\right)
$$

Treat cross‑entropy as loss function and optimize with gradient descent.