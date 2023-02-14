//! Variables y Selectores
const formulario = document.getElementById('agregar-gasto');
const gastosListado = document.querySelector('#gastos ul');


//! Eventos
eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    formulario.addEventListener('submit', agregarGasto);
}

//! Classes
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id) {
        /**
         * Recorre el arreglo de gastos (gasto) por el 'id' y devuelve todos excepto el que se le pasa,
         * que en este caso es el que se quiere eliminar
         */
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);

        this.calcularRestante();
    }
}

class UI {
    insertarPresupuesto(cantidad) {
        //* Extrayendo el valor
        const { presupuesto, restante } = cantidad;

        //* Agregando al HTML
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo, dato) {
        //* Crear vid
        const div = document.createElement('DIV');
        div.classList.add('text-center', 'alert');

        if (tipo === 'error') {
            div.classList.add('alert-danger');

        } else {
            div.classList.add('alert-success');
        }

        //* Mensaje de error
        div.textContent = mensaje;


        //* Insertar en el HTML
        document.querySelector('.primario').insertBefore(div, formulario);

        //* Eliminar del HTML
        setTimeout(() => {
            div.remove();
            if (dato) {
                document.querySelector('#cantidad').value = '';
            };
        }, 3000)

    }

    motrarGastos(gastos) {

        //* Limpiar el HTML del arreglo de 'gastos'
        this.limpiarHTML();


        //* Iterar sobre los gastos
        gastos.forEach(gasto => {
            const { cantidad, nombre, id } = gasto;

            //* Crear un li
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;


            //* Agregar el HTML del gasto
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$ ${cantidad} </span>`;


            //* Boton para borrar el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times';
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);


            //* Agregar al HTML
            gastosListado.appendChild(nuevoGasto);

        });

    }

    limpiarHTML() {
        while (gastosListado.firstChild) {
            gastosListado.removeChild(gastosListado.firstChild);
        }
    }

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;

        const restanteDiv = document.querySelector('.restante');

        //* Comprobar si se ha gastado mas del 25%
        if (presupuesto * 0.75 > restante) {
            console.log('Entrando a menos del 75%');
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-warning');
        }
        if (presupuesto * 0.5 > restante) {
            console.log('Entrando a menos del 25%');
            restanteDiv.classList.remove( 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else {
            restanteDiv.classList.remove('alert-warning', 'alert-danger');
            restanteDiv.classList.add('alert-success');
        }




        //* Si el total es 0 o menor
        if (restante <= 0) {
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');

            //* Deja deshabilitado el boton de agregar cuando se acabo el presupuesto
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }

}

let presupuesto;  //TODO Aqui creo la variable 'presupuesto' xq necesito que sea global, despues que se valida se instancia
const ui = new UI();

//! Funciones
function preguntarPresupuesto() {
    const presupuestoUsuario = prompt('¿Cual es tu presupuesto?');

    if (presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        window.location.reload();
    }

    presupuesto = new Presupuesto(presupuestoUsuario);

    ui.insertarPresupuesto(presupuesto);
}


//* Agrega Gastos
function agregarGasto(e) {
    e.preventDefault();
    let dato = false; //* Bandera para saber cuando el error es en la entrada de 'cantidad'

    //* Leer los datos del Formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

    //* Validar
    if (nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error', dato);
        return;
    }
    else if (cantidad <= 0 || isNaN(cantidad)) {
        dato = true;
        ui.imprimirAlerta('La cantidad debe ser valida', 'error', dato);
        return;
    }

    //* Generar un objeto con el gasto
    const gasto = { nombre, cantidad, id: Date.now() }; //* Crea un objeto con las propiedades de 'nombre' y 'cantidad'

    //* Agrega un nuevo gasto
    presupuesto.nuevoGasto(gasto);

    //* Mensaje de Todo Bien!
    ui.imprimirAlerta('Gasto Agregado...');

    //* Imprime los gastos
    const { gastos, restante } = presupuesto;
    ui.motrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    //* Reinicia el formulario despues de agregar los datos
    formulario.reset();
}

function eliminarGasto(id) {
    //* Elimina los gastos del OBJETO   
    presupuesto.eliminarGasto(id);
    
    const { gastos, restante } = presupuesto;

    //* Elimina los gastos del HTML
    ui.motrarGastos(gastos);

    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}