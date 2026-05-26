void main(){
  Animal nom = new Animal();
  nom.nombre = "Gato";
  nom.fecha = 1999;
  Herbivoro her = new Herbivoro();
  her.nombre = "Elefantes";
  her.fecha = 2000;
  Carnivoro car = new Carnivoro();
  car.nombre ="Leon";
  car.fecha = 1998;
  Omnivoro om = new Omnivoro();
  om.nombre ="Hombre";
  om.fecha = 1888;
  Conejo co = new Conejo();
  co.nombre ="Lupi";
  co.fecha = 2024;
  Leon le = new Leon();
  le.nombre = "leo";
  le.fecha = 1594;
  Hiena hi = new Hiena();
  hi.nombre = " mateo";
  hi.fecha =2002;
  Hombre ho = new Hombre();
  ho.nombre = "Hugo";
  ho.fecha = 2008;
  







}



class Animal {
  String? nombre;
  int? fecha;
}
class Herbivoro extends Animal{
  void comer(){
    print("El come plantas");
  }
}
class Carnivoro extends Animal{
  void seAlimenta(){
    print("Se alimenta de carne");
  }
}
class Omnivoro extends Animal{
  void nosAlimentamos(){
    print("Nos alimentamos de todo ");
  }
}
class Conejo extends Herbivoro{
  void Saltar(){
    print("El conejo salta");
  }
}
class Leon extends Carnivoro{
void cazar(){
  print("Cazan su comida");
}
}
class Hiena extends Carnivoro{
  void comunicar(){
    print("Se comunican entre risas");

  } 
}

class Hombre extends Omnivoro{
  void comen(){
    print("Comen de todo");
  }


}

