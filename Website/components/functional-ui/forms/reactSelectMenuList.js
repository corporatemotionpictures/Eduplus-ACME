import { components } from 'react-select'
import { CellMeasurer, CellMeasurerCache, List, AutoSizer } from 'react-virtualized';


const MenuList = props => {

    const rows = props.children;
    var height = props.maxHeight;

    if (rows.props && rows.props.children) {
        return <components.Control {...props}>
            <div className="text-center pl-4">   {rows.props && rows.props.children}</div>
        </components.Control>
    }
    else if (rows.length < 7) {
        return <components.Control {...props}>
            {props.children}
        </components.Control>
    } else {

        const cache = new CellMeasurerCache({
            defaultHeight: 50,
            fixedWidth: true
        });

        function rowRenderer({ index, isScrolling, key, parent, style }) {

            return (
                <CellMeasurer
                    cache={cache}
                    columnIndex={0}
                    key={key}
                    parent={parent}
                    rowIndex={index}
                >

                    {({ measure, registerChild }) => (
                        // 'style' attribute required to position cell (within parent List)
                        <div ref={registerChild} style={style}>
                            {rows[index]}
                        </div>
                    )}
                </CellMeasurer>
            );
        }

        return (
            <List
                style={{ width: '100%' }}
                width={500}
                rowCount={rows.length ? rows.length : 0}
                height={height}
                deferredMeasurementCache={cache}
                rowHeight={cache.rowHeight < 35 ? 35 : cache.rowHeight}
                rowRenderer={rowRenderer}
            />
        )

    }
}

export default MenuList