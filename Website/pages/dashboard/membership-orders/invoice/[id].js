import { FiBox } from 'react-icons/fi'
import SectionTitle from 'components/functional-ui/section-title'
import Widget from 'components/functional-ui/widget'
import { fetchByID } from 'helpers/apiService';
import { Component } from 'react';
import moment from 'moment';
import Invoice from 'pages/invoice';

import define from 'src/json/worddefination.json'

export default class InvoiceT extends Component {
    state = {
        order: null
    }

    static getInitialProps({ query }) {
        return query;
    }

    fetchData = async (id) => {

        var data = await fetchByID('orders', id , { noLog: true });
        this.setState(data)
    }

    // 
    componentDidMount() {
        let id = this.props.id
        this.fetchData(id);
    }

    print() {
        if(screen.width <= 767){
            document.getElementsByClassName('subpage')[0].style.zoom = '100%'
        }
        var fileName = this.state.order.order_number
        var element = document.getElementsByClassName('subpage')[0];

        var opt = {
            margin: 0,
            filename: `${fileName}.pdf`,
            image: {
                type: 'jpeg',
                quality: 1
            },
            html2canvas: {
                dpi: 300,
                scale: 1,
            },
            jsPDF: {
                unit: 'mm',
                format: [210, 297],
                orientation: 'portrait'
            },
        };
        html2pdf(element, opt);
        if(screen.width <= 767){
            document.getElementsByClassName('subpage')[0].style.zoom = '60%'
        }
    }

    render() {
        return (
            <>
                <head >
                    <link rel="stylesheet" href="/website/assets/css/bootstrap.min.css" />

                </head>
                <Invoice id={this.props.id} />

            </>
        )
    }
}
